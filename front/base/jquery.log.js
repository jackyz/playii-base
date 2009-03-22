// **** mock console if not avaliable
/*
if (window.console === undefined) window.console = (function(){
  function log(lvl, str){
    $("#log").append("["+lvl+"]"+str+"<br>");
    // auto scroll to bottom
    var t = $("#log").get(0).scrollHeight;
    var v = $("#log").get(0).offsetHeight;
    $("#log").get(0).scrollTop = t - v;
  }
  $(document).keydown(function(e){
    // alert(e.keyCode);
    if(e.keyCode == 119){ // bind F8 key as log mode
      $("#log").toggle();
      return false;
    }
  });
  return {
    debug: function(s){ log("DEBUG", s); },
    info:  function(s){ log("INFO ", s); },
    error: function(s){ log("ERROR", s); },
    warn:  function(s){ log("WARN ", s); },
    fatal: function(s){ log("FATAL", s); }
  };
})();
*/

(function($){
  $.thread = function(func, time){
    window.setTimeout(func, time ? time : 50);
  };
  $.source = function(obj){
    return obj.toSource();
  };
  $.unhtml = function(s){
    return s.replace('<', '&lt;').replace('>', '&gt;');
  };
  $.log = function(msg){
    console.debug(msg);
  };
  $.err = function(msg){
    console.error(msg);
  };
  $.fn.log = function(msg){
    console.debug("%s: %o", msg, this);
    return this;
  };
  $.fn.err = function(msg){
    console.error("%s: %o", msg, this);
    return this;
  };
})(jQuery);
