#!/usr/bin/python
import logging
from fiveone import FiveOne
from google.appengine.ext import webapp
from django.utils import simplejson as json
from google.appengine.ext.webapp.util import run_wsgi_app

class GetInfo(webapp.RequestHandler):
    def get(self):
        fo = FiveOne(
            api_key="aa6379fe399e4c9a22777623354bd1e4", 
            secret_key="1515c7413482407872b3fdc3a98bba1d", 
            app_name="playii_chat", 
            callback_path="/chat/51.html", 
            internal=True)
        if not fo.check_session(self.request):
            return self.redirect(fo.get_add_url())
        # make api calls now
        logging.debug('Testing users.getInfo')
        info = fo.users.getInfo(
            uids=[fo.user],
            fields=["uid", "username", "nickname", "sex", "facesmall"])
        logging.debug('Got user info: %s' % info)
        # response json
        self.response.headers['Content-Type'] = 'text/javascript'
        self.response.out.write( json.dumps(info) )

application = webapp.WSGIApplication(
    [('/51/GetInfo.js', GetInfo)], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()

