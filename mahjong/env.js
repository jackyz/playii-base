(function(){

  // log functions
  function _log(level, str){
    var d = new Date();
    print("["+
	  (d.getFullYear()) +'.'+
	  (d.getMonth() + 1) +'.'+
          (d.getDate()) +'-'+
          (d.getHours()) +':'+
          (d.getMinutes()) +':'+
          (d.getSeconds()) +
	  "] "+ level +": "+ str);
  }

  function stringfy(v){
    return (typeof(v) == "string") ? '"'+v+'"' : v.toSource() ;
  }

  // cast function
  function _cast(who){
    var cmdline = [];
    function _func(func){
      cmdline.push( stringfy(func) );
      return _args;
    }
    function _args(){
      var l = [];
      for (var i = 0; i<arguments.length; i++) l.push(arguments[i]);
      cmdline.push( stringfy(l) );
      debug(cmdline[0]+"("+cmdline[1]+")("+cmdline[2]+")("+cmdline[3]+")");
      cmdline = [];
    }
    cmdline.push("cast");
    var l;
    if (typeof(who) == "string") {
      l = who;
    } else if (typeof(who) == "object") {
      l = [];
      for (var n in who) l.push(n);
    }
    cmdline.push( stringfy(l) );
    return _func;
  }

  // parse function
  function _parse(){

    var runtime = {};
    runtime.cast  = _cast;
    seal(runtime, true);

    var l = "", s = "", e = 0;
    do {
      l = readline();
      if (l.length == 0) e++;
      else e = 0, s += l+"\n";
    } while(e < 10);
    // readline does not wait, nor return an EOF, so just a tricky

    try {
      var o = evalcx(s, runtime);
      return o;
    } catch(e) {
      throw new Error("parse error:"+e.toSource());
    }

  }

  // time function
  function _pass(mark){
    var tx = (new Date()).getTime();
    if (!mark.last) mark.last = tx;
    var r = tx - mark.last;
    mark.last = tx;
    return r;
  }

  // test function
  function _assert(b, e){
     if(!b) throw new Error(!e ? "assert fail" : e);
  }

  // export to global for test case
  parse  = _parse;
  pass   = _pass;
  assert = _assert;
  fatal  = function(str){ _log("FATAL",str); };
  error  = function(str){ _log("ERROR",str); };
  warn   = function(str){ _log(" WARN",str); };
  info   = function(str){ _log(" INFO",str); };
  debug  = function(str){ _log("DEBUG",str); };

})();
