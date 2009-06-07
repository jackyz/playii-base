
(function($){
  $.thread = function(func, time){
    var threadId = window.setTimeout(func, time ? time : 50);
    return threadId;
  };
  $.cancel = function(threadId){
    window.clearTimeout(threadId);
  };
  $.source = function(obj){
    return obj.toSource();
  };
  $.unhtml = function(s){
    return s.replace('<', '&lt;').replace('>', '&gt;');
  };

  // **** mock console if not avaliable
  if (window["console"] === undefined) window["console"] = (function(){
    // using parent.console if any
    if(parent["console"]) return parent["console"];
    // prepare a console div if needed
    if($("#log").size() == 0){
      $(document).append("<div id='log'></div>").keydown(function(e){
	// alert(e.keyCode);
	if(e.keyCode == 119){ // bind F8 key as log mode
	  $("#log").toggle();
	  return false;
	}
      });
      $("#log").hide();
    }
    function log(lvl, str){
      $("#log").append("["+lvl+"]"+str+"<br>");
      // auto scroll to bottom
      // var t = $("#log").get(0).scrollHeight;
      // var v = $("#log").get(0).offsetHeight;
      // $("#log").get(0).scrollTop = t - v;
      // $.thread(function(){alert("["+lvl+"]"+str);});
    }
    return {
      debug: function(s){ log("DEBUG", s); },
      info : function(s){ log("INFO ", s); },
      error: function(s){ log("ERROR", s); },
      warn : function(s){ log("WARN ", s); },
      fatal: function(s){ log("FATAL", s); }
    };
  })();

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
