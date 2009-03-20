(function(){

   // **** the private static variables

   // for security reason, guest codes need to be run in diffrent context
   var runtime = evalcx('');

   // in order to rehydra data back to object, need store the code object
   // multi instances (data) shares one copy of code
   // ie: table#1234 and table#5678 are all instance of table
   var code = {};

   // in each cycle of run, need store the cmds and logs
   var cbuff = [], lbuff = [];

   // **** the runtime functions for guest code

   // data + code => object
   function rehydra(data, code){
     var object = data;
     for(var f in code){
       if (typeof code[f] != "function") continue;
       object[f] = code[f];
     }
     return object;
   }

   // object - code => data
   function dehydra(object){
     // var data = JSON.stringfy(object);
     var data = object;
     for(var f in data){
       if (typeof data[f] != "function") continue;
       delete data[f];
     }
     return data;
   }

   // append cmd
   function cmd(cmd, args){
     cbuff.push([cmd, args]);
   }

   // append log
   function log(level, str){
     lbuff.push(str);
   }

   // cast
   function cast(who){
     var w, f, a;
     w = who;
     function args(){
       a = [];
       for(var i=0; i<arguments.length; i++) a.push(arguments[i]);
       cmd("cast", [w, f, a]);
     }
     function func(fun){
       f = fun;
       return args;
     }
     return func;
   }

   // **** constuct the runtime

   (function(){
      var $a = rehydra;
      var $c = cast;
      var $d = function(s){ return log("DEBUG", s); };
      var $w = function(s){ return log("WARN ", s); };
      var $i = function(s){ return log("INFO ", s); };
      var $e = function(s){ return log("ERROR", s); };
      var $f = function(s){ return log("FATAL", s); };
      // hide function name for runtime
      runtime.addup    = function(d,c){ return $a(d,c); };
      runtime.cast     = function(w){ return $c(w); };
      runtime.debug    = function(s){ $d(s); };
      runtime.warn     = function(s){ $w(s); };
      runtime.info     = function(s){ $i(s); };
      runtime.error    = function(s){ $e(s); };
      runtime.fatal    = function(s){ $f(s); };
      seal(runtime);
   })();

   // **** the i/o wrapper's primitive function

   // load(scene, source) -> void|throw exception
   function load(scene, source){
     var object = evalcx(source, runtime);
     if (typeof object != 'function')
       throw "return value of script must be function(also an object)";
     var fc = 0;
     for(var n in object){
       if (n == 'prototype') continue;
       if (typeof object[n] != 'function')
	 throw "return value of script the property "+n+" must be function";
       else
	 fc++;
     }
     if (fc == 0)
       throw "return value of script does not defined any property";
     code[scene] = object;
   }

   // init(scene, args) -> data|throw exception
   function init(scene, args){
     var object = {};
     code[scene].apply(object, args);
     return dehydra(object);
   }

   // exec(scene, data, fun, args) -> data2|throw exception
   function exec(scene, data, fun, args){
     var object = rehydra(data, code[scene]);
     object[fun].apply(object, args);
     return dehydra(object);
   }

   // **** the i/o wrapper's main loop (and steps)

   // execline
   function execline(l){
     var r, c;
     cbuff = [], lbuff = [];
     try{
       // i don't know why but this never throw exception
       // seems when evalcx goes wrong it direct quit entire vm
       var x = evalcx(l, runtime); // TODO from json
       c = x[0] || "any";
       switch(c){
       case "load": // load(scene, source) -> void|throw exception
	 load(x[1], x[2]);
	 r = ["load", 1, cbuff, lbuff];
	 break;
       case "init": // init(scene, args) -> data
	 var data = init(x[1], x[2]);
	 r = ["init", 1, data, cbuff, lbuff];
	 break;
       case "exec": // exec(scene, data, fun, args) -> data2
	 var data2 = exec(x[1], x[2], x[3], x[4]);
	 r = ["exec", 1, data2, cbuff, lbuff];
	 break;
       default:
	 r = ["any", 0, "unknow command "+x[0], cbuff, lbuff];
       }
     }catch(e){
       r = [c, 0, e, cbuff, lbuff];
     }
     cbuff = [], lbuff = [];
     return r.toSource();  // TODO to json
   }

   // loop
   function loop(){
     var e = 0;
     do {
       var l = readline();
       if (l.length == 0) { e++; continue; } else { e=0; }
       print("<< "+l);
       print(">> "+execline(l));
     } while(e < 10);
     print("<< END");
   }

   // **** export to outside world

   return {loop:loop};

})().loop();

/*
// define an function-as-an-object
// as a function, it's constructor of new objects
// as an object, it's methods to be cloned for new objects
// var Class = .... // the code below
// var instance = rehydra(new Class(), Class);
(function(){
   // private, constants or shared static variables
   // export the function-as-an-object
   // rehydra is a function-cloner
   return mixin(function(x){
     // constructor
     this.x = x;
   },{
     // methods
     eventa:function(){
     },
     eventb:function(){
     }
   });
})();
*/
