"""This is some simple helper code to bridge the Pylons / py51 gap.

There's some generic WSGI middleware, some Paste stuff, and some Pylons
stuff.  Once you put FiveOneWSGIMiddleware into your middleware stack,
you'll have access to ``environ["fiveone.fiveone"]``, which is a
``fiveone.FiveOne`` object.  If you're using Paste (which includes
Pylons users), you can also access this directly using the fiveone
global in this module.

"""

# Be careful what you import.  Don't expect everyone to have Pylons,
# Paste, etc. installed.  Degrade gracefully.

from fiveone import FiveOne

__docformat__ = "restructuredtext"


# Setup Paste, if available.  This needs to stay in the same module as
# FiveOneWSGIMiddleware below.

try:
    from paste.registry import StackedObjectProxy
    from paste.httpexceptions import _HTTPMove
except ImportError:
    pass
else:
    fiveone = StackedObjectProxy(name="py51 FiveOne Connection")


    class CanvasRedirect(_HTTPMove):

        """This is for canvas redirects."""

        title = "See Other"
        code = 200
        template = '<xn:redirect url="%(location)s" />'


class FiveOneWSGIMiddleware(object):

    """This is WSGI middleware for Manyou."""

    def __init__(self, app, config, fiveone_class=FiveOne):
        """Initialize the Manyou middleware.

        ``app``
            This is the WSGI application being wrapped.

        ``config``
            This is a dict containing the keys "fiveone.apikey" and
            "fiveone.secret".

        ``fiveone_class``
            If you want to subclass the FiveOne class, you can pass in
            your replacement here.  Pylons users will want to use
            PylonsFiveOne.

        """
        self.app = app
        self.config = config
        self.fiveone_class = fiveone_class

    def __call__(self, environ, start_response):
        config = self.config
        real_facebook = self.manyou_class(config["fiveone.apikey"],
                                            config["fiveone.secret"])
        registry = environ.get('paste.registry')
        if registry:
            registry.register(fiveone, real_facebook)
        environ['fiveone.fiveone'] = real_facebook
        return self.app(environ, start_response)


# The remainder is Pylons specific.

try:
    import pylons
    from pylons.controllers.util import redirect_to as pylons_redirect_to
    from webhelpers import url_for
except ImportError:
    pass
else:


    class PylonsFiveOne(FiveOne):

        """Subclass Manyou to add Pylons goodies."""

        def check_session(self, request=None):
            """The request parameter is now optional."""
            if request is None:
                request = pylons.request
            return FiveOne.check_session(self, request)

        # The Django request object is similar enough to the Paste
        # request object that check_session and validate_signature
        # should *just work*.

        def redirect_to(self, url):
            """Wrap Pylons' redirect_to function so that it works not in_canvas.

            By the way, this won't work until after you call
            check_session().

            """
            if not self.in_canvas:
                raise CanvasRedirect(url)
            pylons_redirect_to(url)

        def apps_url_for(self, *args, **kargs):
            """Like url_for, but starts with "http://apps.51.com"."""
            return "http://apps.51.com" + url_for(*args, **kargs)


    def create_pylons_manyou_middleware(app, config):
        """This is a simple wrapper for FiveOneWSGIMiddleware.

        It passes the correct manyou_class.

        """
        return FiveOneWSGIMiddleware(app, config,
                                      manyou_class=PylonsFiveOne)
