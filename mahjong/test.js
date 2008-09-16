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

  var cmdline = [];

  // cast function
  function _args(){
    var args = [];
    for (var i = 0; i<arguments.length; i++) args.push(arguments[i]);
    cmdline.push(args);
    debug(cmdline[0]+"("+cmdline[1]+")("+cmdline[2]+")("+cmdline[3]+")");
    cmdline = [];
  }
  function _func(func){
    cmdline.push(func);
    return _args;
  }
  function _cast(who){
    cmdline.push("cast");
    cmdline.push(who);
    return _func;
  }

  var mark = 0;

  function _timepass(){
    var tx = (new Date()).getTime();
    var r = tx - mark;
    mark = tx;
    return r;
  }

  function _assert(b){
    if(!b) throw new Error("assert fail");
  }

  fatal = function(str){ _log("FATAL",str); };
  error = function(str){ _log("ERROR",str); };
  warn  = function(str){ _log(" WARN",str); };
  info  = function(str){ _log(" INFO",str); };
  debug = function(str){ _log("DEBUG",str); };
  tc    = _timepass;
  assert= _assert;

})();
