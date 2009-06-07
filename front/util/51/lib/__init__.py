#! /usr/bin/env python
# py51 - Python bindings for the 51 API
# Copyright (c) 2008, (Damien) Yongrong Hou houyongr(at)gmail dot com
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# This work is based on pyfacebook, whose license is shown below
#
# Copyright (c) 2008, Samuel Cormier-Iijima
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#     * Neither the name of the <organization> nor the
#       names of its contributors may be used to endorse or promote products
#       derived from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY <copyright holder> ``AS IS'' AND ANY
# EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL <copyright holder> BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

"""
Python bindings for the 51 API (py51 - http://code.google.com/p/py51)

py51 is a client library that wraps the 51 API.

For more information, see

Home Page: http://code.google.com/p/py51
Developer Wiki: http://code.google.com/p/py51/w/list

Response format defaults to XML, since 51 API currently doesn't seem to support JSON
for some of the API calls
May switch to JSON when 51 supports it
"""

import logging
import md5
import sys
import time
import urllib
import urllib2
import httplib
import urlparse
import mimetypes
from urlparse import urljoin

from django.utils import simplejson
from xml.dom import minidom
RESPONSE_FORMAT = 'XML'
# support Google App Engine.  GAE does not have a working urllib.urlopen.
try:
    from google.appengine.api import urlfetch

    def urlread(url, data=None):
        if data is not None:
            headers = {"Content-type": "application/x-www-form-urlencoded"}
            method = urlfetch.POST
        else:
            headers = {}
            method = urlfetch.GET

        result = urlfetch.fetch(url, method=method,
                                payload=data, headers=headers)
        
        if result.status_code == 200:
            return result.content
        else:
            raise urllib2.URLError("fetch error url=%s, code=%d" % (url, result.status_code))

except ImportError:
    def urlread(url, data=None):
        res = urllib2.urlopen(url, data=data)
        return res.read()
    
__all__ = ['FiveOne']

VERSION = '1.2'

# REST URLs
FIVEONE_URL = 'http://api.51.com/1.0/restserver.php'
FIVEONE_SECURE_URL = 'http://api.51.com/1.0/restserver.php'

class json(object): pass

# simple IDL for the 51 API
METHODS = {
    # feed methods
    'feed': {
        'publishTemplatizedAction': [
            ('template_id', int, []),
            ('body_data', json, []),
            ('uids', list, []),
        ],
    },

    # friends methods
    'friends': {
        'areFriends': [
            ('uids1', list, []),
            ('uids2', list, []),
        ],


        'getAppUsers': [],
        
        'get': [
            ('uid', str, [])
        ],
    },
    
    # photos methods
    'photos': {
        'getHome':[
            ('uid', str, []),
        ],
        
        'getAlbums':[
            ('uid', str, ['optional']),
            ('aids', list, ['optional']),
        ],
        
        'get':[
            ('uid', str, []),
            ('aid', int, ['optional']),
            ('pids', list, ['optional']),  
        ],
    },
    
    # homes methods
    'homes': {
        'getInfo':[
            ('uids', list, []),
            ('fields', list, [('default',['title','music'])]),
        ],
    },

    # profile methods
    'profile': {
        'set51ML': [
            ('profile', str, []),
        ],

        'get51ML': [
            ('uid', str, ['optional']),
        ],
    },

    # users methods
    'users': {
        'getInfo': [
            ('uids', list, []),
            ('fields', list, [('default', ['uid'])]),
        ],
        
        'invite': [
            ('invitees', list, []),
            ('reason', str, []),
        ],
    },
}

class Proxy(object):
    """Represents a "namespace" of 51 API calls."""

    def __init__(self, client, name):
        self._client = client
        self._name = name

    def __call__(self, method, args=None, add_session_args=True):
        if add_session_args:
            self._client._add_session_args(args)

        return self._client('%s.%s' % (self._name, method), args)


# generate the 51 proxies
def __generate_proxies():
    for namespace in METHODS:
        methods = {}

        for method in METHODS[namespace]:
            params = ['self']
            body = ['args = {}']

            for param_name, param_type, param_options in METHODS[namespace][method]:
                param = param_name

                for option in param_options:
                    if isinstance(option, tuple) and option[0] == 'default':
                        if param_type == list:
                            param = '%s=None' % param_name
                            body.append('if %s is None: %s = %s' % (param_name, param_name, repr(option[1])))
                        else:
                            param = '%s=%s' % (param_name, repr(option[1]))

                if param_type == json:
                    # we only jsonify the argument if it's a list or a dict, for compatibility
                    body.append('if isinstance(%s, list) or isinstance(%s, dict): %s = simplejson.dumps(%s)' % ((param_name,) * 4))

                if 'optional' in param_options:
                    param = '%s=None' % param_name
                    body.append('if %s is not None: args[\'%s\'] = %s' % (param_name, param_name, param_name))
                else:
                    body.append('args[\'%s\'] = %s' % (param_name, param_name))

                params.append(param)

            # simple docstring to refer them to 51 API docs
            body.insert(0, '"""51 API call. See http://developers.51.com/wiki/%s.%s"""' % (namespace, method))

            body.insert(0, 'def %s(%s):' % (method, ', '.join(params)))

            body.append('return self(\'%s\', args)' % method)

            exec('\n    '.join(body))

            methods[method] = eval(method)

        proxy = type('%sProxy' % namespace.title(), (Proxy, ), methods)

        globals()[proxy.__name__] = proxy


__generate_proxies()


class FiveOneError(Exception):
    """Exception class for errors received from 51."""

    def __init__(self, code, msg, args=None):
        self.code = code
        self.msg = msg
        self.args = args

    def __str__(self):
        return 'Error %s: %s' % (self.code, self.msg)

class FriendsProxy(FriendsProxy):
    """Special proxy for 51.friends."""

    def get(self, **kwargs):
        """51 API call. See http://developers.51.com/wiki/index.php?title=Friends.get"""
        if self._client._friends:
            return self._client._friends
        return super(FriendsProxy, self).get(**kwargs)

class FiveOne(object):
    """
    Provides access to the 51 API.

    Instance Variables:

    added
        True if the user has added this application.

    api_key
        Your API key, as set in the constructor.
        
    app_name
        Your application's name, i.e. the APP_NAME in http://apps.facebook.com/APP_NAME/ if
        this is for an internal web application. Optional, but useful for automatic redirects
        to canvas pages.
        
    auth_token
        The auth token that 51 gives you, either with 51.auth.createToken,
        or through a GET parameter.

    callback_path
        The path of the callback set in the 51 app settings. If your callback is set
        to http://www.example.com/51/callback/, this should be '/51/callback/'.
        Optional, but useful for automatic redirects back to the same page after login.

    internal
        True if this 51 object is for an internal application (one that can be added on 51)

    secret
        Secret that is used after getSession for desktop apps.

    secret_key
        Your application's secret key, as set in the constructor.

    session_key
        The current session key. Set automatically by auth.getSession, but can be set
        manually for doing infinite sessions.

    session_key_expires
        The UNIX time of when this session key expires, or 0 if it never expires.

    user
        After a session is created, you can get the user's username on 51.com with this variable. Set
        automatically by auth.getSession.
        
    time

    ----------------------------------------------------------------------

    """

    def __init__(self, api_key, secret_key, auth_token=None, app_name=None, callback_path=None, time=None, internal=None, proxy=None):
        """
        Initializes a new 51 object which provides wrappers for the 51 API.

        For web apps, if you are passed an auth_token from 51, pass that in as a named parameter.
        Then call:

        51.auth.getSession()

        """
        self.api_key = api_key
        self.secret_key = secret_key
        self.session_key = None
        self.session_key_expires = None
        self.auth_token = auth_token
        self.secret = None
        self.user = None
        self.in_canvas = False
        self.app_name = app_name
        self.callback_path = callback_path
        self.internal = internal
        self.time = time
        self._friends = None
        self.proxy = proxy

        for namespace in METHODS:
            self.__dict__[namespace] = eval('%sProxy(self, \'%s\')' % (namespace.title(), 'fiveone.%s' % namespace))

    def unicode_encode(self, str):
        """
        @author: houyr
        Detect if a string is unicode and encode as utf-8 if necessary
        """
        return isinstance(str, unicode) and str.encode('utf-8') or str

    def _hash_args(self, args, secret=None):
        """Hashes arguments by joining key=value pairs, appending a secret, and then taking the MD5 hex digest."""
        str = u''.join([u'%s=%s' % (x, args[x]) for x in sorted(args.keys())])
        if secret:
            str += secret
        elif self.secret:
            str += self.secret
        else:
            str += self.secret_key
        #This SUCKS!!!!
        #sig must be encoded in GBK, while post string be UTF-8.
        #otherwise, meet the "incorrect signature" error
        str = str.encode('GBK') if isinstance(str, unicode) else str
        hasher = md5.new(str)
        return hasher.hexdigest()

    def _parse_response_item(self, node):
        """Parses an XML response node from 51."""
        if node.nodeType == node.DOCUMENT_NODE and \
            node.childNodes[0].hasAttributes() and \
            node.childNodes[0].hasAttribute('list') and \
            node.childNodes[0].getAttribute('list') == "true":
            return {node.childNodes[0].nodeName: self._parse_response_list(node.childNodes[0])}
        elif node.nodeType == node.ELEMENT_NODE and \
            node.hasAttributes() and \
            node.hasAttribute('list') and \
            node.getAttribute('list')=="true":
            return self._parse_response_list(node)
        elif len(filter(lambda x: x.nodeType == x.ELEMENT_NODE, node.childNodes)) > 0:
            return self._parse_response_dict(node)
        else:
            return ''.join(node.data for node in node.childNodes if node.nodeType in [node.TEXT_NODE, node.CDATA_SECTION_NODE])


    def _parse_response_dict(self, node):
        """Parses an XML dictionary response node from 51."""
        result = {}
        for item in filter(lambda x: x.nodeType == x.ELEMENT_NODE, node.childNodes):
            result[item.nodeName] = self._parse_response_item(item)
        if node.nodeType == node.ELEMENT_NODE and node.hasAttributes():
            if node.hasAttribute('id'):
                result['id'] = node.getAttribute('id')
        return result


    def _parse_response_list(self, node):
        """Parses an XML list response node from 51."""
        result = []
        for item in filter(lambda x: x.nodeType == x.ELEMENT_NODE, node.childNodes):
            result.append(self._parse_response_item(item))
        return result


    def _check_error(self, response):
        """Checks if the given 51 response is an error, and then raises the appropriate exception."""
        if type(response) is dict and response.has_key('error_code'):
            raise FiveOneError(response['error_code'], response['error_msg'], response.get('request_args','no request_args found'))


    def _build_post_args(self, method, args=None):
        """Adds to args parameters that are necessary for every call to the API."""
        if args is None:
            args = {}

        for arg in args.items():
            if type(arg[1]) == list:
                args[arg[0]] = ','.join(str(a) for a in arg[1])
            elif type(arg[1]) == unicode:
                args[arg[0]] = arg[1]

        args['user'] = self.user
        args['app_key'] = self.api_key
        args['time'] = self.time
        args['method'] = method
        args['version'] = VERSION
        args['sdk_from'] = 'py51'
        args['session_key'] = self.session_key
        args['sig'] = self._hash_args(args)
        #putting format in args will cause incorrect signature error - WTF?
#        args['format'] = RESPONSE_FORMAT
        
        return args

    def _add_session_args(self, args=None):
        """Adds 'session_key' and 'call_id' to args, which are used for API calls that need sessions."""
        if args is None:
            args = {}

        if not self.session_key:
            return args

        args['session_key'] = self.session_key
        # no need to use call_id
#        args['call_id'] = time.time()

        return args


    def _parse_response(self, response, method, format=None):
        """Parses the response according to the given (optional) format, which should be either 'JSON' or 'XML'."""
        if not format:
            format = RESPONSE_FORMAT

        #Use XML for now
        if format == 'JSON':
            result = simplejson.loads(response)
            self._check_error(result)
        elif format == 'XML':
            dom = minidom.parseString(response)
            result = self._parse_response_item(dom)
            dom.unlink()
            if 'error_response' in result:
                self._check_error(result['error_response'])
            key = method[8:].replace('.', '_') + '_response'
            info = result.get(key,'')
            if not info:
                #WTF! some xml tag names are in lower case, so try this
                info = result.get(key.lower(),'')
        else:
            raise RuntimeError('Invalid format specified.')

        return info

    def unicode_urlencode(self,params):
        """
        @author: houyr
        A unicode aware version of urllib.urlencode
        """
        if isinstance(params, dict):
            params = params.items()
        return urllib.urlencode([(k, self.unicode_encode(v))
                          for k, v in params])

        
    def __call__(self, method, args=None, secure=False):
        """Make a call to FiveOne's REST server."""
        #@author: houyr
        #Fix for bug of UnicodeEncodeError
        post_args = {}
        for k,v in self._build_post_args(method, args).items():
            if k != 'sig':
                post_args['51_sig_'+k] = v
            else:
                post_args['51_sig'] = v
        
        post_data = self.unicode_urlencode(post_args)
        if self.proxy:
            proxy_handler = urllib2.ProxyHandler(self.proxy)
            opener = urllib2.build_opener(proxy_handler)
            if secure:
                response = opener.open(FIVEONE_SECURE_URL, post_data).read() 
            else:
                response = opener.open(FIVEONE_URL, post_data).read()
        else:
            if secure:
                response = urlread(FIVEONE_SECURE_URL, post_data)
            else:
                response = urlread(FIVEONE_URL, post_data)
        
        return self._parse_response(response, method)

    
    # URL helpers
    def get_url(self, page, **args):
        """
        Returns one of the 51 apps URLs (apps.51.com/SOMEPAGE.php).
        Named arguments are passed as GET query string parameters.

        """
        return 'http://apps.51.com/%s.php?%s' % (page, urllib.urlencode(args))
    
    def get_app_url(self, path=''):
        """
        Returns the URL for this app's canvas page, according to app_name.
        
        """
        return 'http://apps.51.com/%s/%s' % (self.app_name, path)
        
    def get_add_url(self, next=None):
        """
        Returns the URL that the user should be redirected to in order to add the application.

        """
        args = {'app_key': self.api_key}

        if next is not None:
            args['next'] = next

        return self.get_url('add', **args)
    
    def get_login_url(self, next=None):
        """
        Returns the URL that the user should be redirected to in order to login.

        next -- the URL that 51 should redirect to after login

        """
        args = {'app_key': self.api_key, 'v': '1.0'}

        if next is not None:
            args['next'] = next

        return self.get_url('login', **args)

    def check_session(self, request):
        """
        Checks the given Django HttpRequest for 51 parameters such as
        POST variables or an auth token. If the session is valid, returns True
        and this object can now be used to access the 51 API. Otherwise,
        it returns False, and the application should take the appropriate action
        (either log the user in or have him add the application).

        """
        self.in_canvas = (request.POST.get('51_sig_in_canvas') == '1')

        if self.session_key and self.user:
            return True

        if request.method == 'POST':
            params = self.validate_signature(request.POST)
        else:
            if 'auth_token' in request.GET:
                self.auth_token = request.GET['auth_token']

                try:
                    self.auth.getSession()
                except FiveOneError, e:
                    self.auth_token = None
                    return False

                return True

            params = self.validate_signature(request.GET)

        if not params:
            return False
        if params.get('in_canvas') == '1':
            self.in_canvas = True
            
        if 'time' in params:
            self.time = params['time']

        if params.get('expires'):
            self.session_key_expires = int(params['expires'])

        # not really necessary with 51
        if 'friends' in params:
            if params['friends']:
                self._friends = params['friends'].split(',')
            else:
                self._friends = []

        if 'session_key' in params:
            self.session_key = params['session_key']
            if 'user' in params:
                self.user = params['user']
            else:
                return False
        else:
            return False

        return True


    def validate_signature(self, post, prefix='51_sig', timeout=None):
        """
        Validate parameters passed to an internal FiveOne app from FiveOne.

        """
        args = post.copy()

        if prefix not in args:
            return None

        del args[prefix]

        if timeout and '%s_time' % prefix in post and time.time() - float(post['%s_time' % prefix]) > timeout:
            return None

        args = dict([(key[len(prefix + '_'):], value) for key, value in args.items() if key.startswith(prefix)])

        hash = self._hash_args(args)

        if hash == post[prefix]:
            return args
        else:
            return None
