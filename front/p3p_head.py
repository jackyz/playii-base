#!/usr/bin/python
import os, re, logging
import wsgiref.handlers
from google.appengine.ext import webapp
from google.appengine.api import memcache

memCacheExpire = 900

def getFileName(path):
  regex = re.compile('/[a-zA-Z_]+/([a-zA-Z0-9_\-/]+\.(html))$')
  return 'html/' + regex.search(path).groups()[0]

def getFileContent(filename):
    ospath = os.path.join(os.path.dirname(__file__), filename)
    # logging.error(ospath)
    input = open(ospath, 'r')
    return input.read()

class AddP3p(webapp.RequestHandler):
    def get(self):
        filename = getFileName(self.request.path)
        # logging.error(filename)
        data = getFileContent(filename)
        
        self.response.headers['Content-Type'] = 'text/html'
        self.response.headers['P3P'] = 'CP="IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT"'
        self.response.out.write(data)

apps_binding = []
apps_binding.append(('/chat/.*', AddP3p))

application = webapp.WSGIApplication(apps_binding, debug=True)
wsgiref.handlers.CGIHandler().run(application)
