// playii js

// **** the list object
if (!this.LIST) LIST = function(){

  // ** func(e) return true | false
  function all(func, array){
    for (var i=0; i<array.length; i++){
      if (!func(array[i])) return false;
    }
    return true;
  }

  // ** func(e) return true | false
  function any(func, array){
    for (var i=0; i<array.length; i++){
      if (func(array[i])) return true;
    }
    return false;
  }

  function clone(array){
    var r = [];
    for (var i=0; i<array.length; i++){
      r.push(array[i]);
    }
    return r;
  }

  function count(e, array){
    var c = 0;
    for (var i=0; i<array.length; i++){
      if (e == array[i]) c++;
    }
    return c;
  }

  // ** func(e) return true | false
  function first(func, array){
    for (var i=0; i<array.length; i++){
      if (func(array[i])) return array[i];
    }
    return undefined;
  }

  // ** func(e) return void
  function foreach(func, array){
    if(!array) return;
    for (var i=0; i<array.length; i++){
      func(array[i]);
    }
  }

  function indexof(e, array){
    for (var i=0; i<array.length; i++){
      if (array[i] == e) return i;
    }
    return -1;
  }

  // ** func(e) return true | false
  function last(func, array){
    for (var i=array.length - 1; i>0; i--){
      if (func(array[i])) return array[i];
    }
    return undefined;
  }

  // ** func(e) return new element
  function map(func, array){
    var r = [];
    for (var i=0; i<array.length; i++){
      r.push(func(array[i]));
    }
    return r;
  }

  function member(e, array){
    for (var i=0; i<array.length; i++){
      if (array[i] == e) return true;
    }
    return false;
  }

  function remove(e, array){
    var r = [], m = false;
    for (var i=0; i<array.length; i++){
      if (!m && array[i] == e) m = true;
      else r.push(array[i]);
    }
    return r;
  }

  return {
    count:count, member:member, indexof:indexof, remove:remove,
    clone:clone, map:map, foreach:foreach,
    all:all, any:any, first:first, last:last
  };

}();

// **** the dict object (hash object)
if (!this.DICT) DICT = function(){

  function foreach(func, dict){
    for(var i in dict){
      func(dict[i]);
    }
  }

  return {
    foreach:foreach
  };

}();

// **** mock console if not avaliable
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



function _src(obj){
  return (obj.toSource) ? obj.toSource() : JSON.stringify(obj);
}

function _log(str){
  window.console.debug(str);
}

function _err(str){
  _yield( function(){ alert(str); } );
}

function _yield(func, time) {
  // _log("_yield("+func.toSource()+","+time+")");
  window.setTimeout(func, time ? time : 50);
}

// **** strip html tag
function _secure(s){
  return $.trim(s).replace('<', '&lt;').replace('>', '&gt;');
}

// **** the scene nameing
function _scene(){
  var url = window.location.hash.split('#')[1];
  return (url) ? url : undefined;
};

// **** get/set cookie
// **** ie will block 3rd party cookie, try put a p3p policy.xml file
function _cookie(name, val){
  if (val != undefined) { // set cookie
    //alert("set cookie "+val);
    document.cookie = name+"="+encodeURIComponent(val);
  } else {   // get cookie
    var c = document.cookie;
    var s = c.indexOf(name+"=");
    var e = c.indexOf(";", s+name.length+1);
    var v;
    if (s != -1) v = decodeURIComponent(c.substring(s+name.length+1, (e==-1)?c.length:e));
    return v;
  }
}

// **** playii ui/i8n object
if(!this.ui) ui = (function(){

  // ******** model
  var i8ns = {};

  // usage: i8n.bind("/chat/room/1234", {"text":"translated text"})
  function bind(sn, obj){
    i8ns[sn] = obj;
  }

  // usage: i8n.unbind("/chat/room/1234")
  function unbind(sn){
    delete i8ns[sn];
  }

  // usage: i8n.tran("/chat/room/1234", "hello, {text1}, {welcome to} name");
  // transfer the text, using the i8n dict
  // {{xxx}} -> {xxx} the escape
  // {xxx} -> yyy if has {xxx : yyy} perform the mapping
  // {xxx} -> xxx if has not xxx using the text itself
  function tran(sn, s){
    // _log("_tran:"+sn+","+s);
    function map(s){
      var x = i8ns[sn][s];
      return x ? x : s;
    }
    function part(h, t){
      var b = t.indexOf("{");
      var e = t.indexOf("}", b);
      if (e > b && e != -1 && b != -1) {
        var h2 = h+t.substr(0, b)+map(t.substr(b+1, e-b-1));
        var t2 = t.substr(e+1, t.length-e-1);
        return part(h2, t2);
      } else {
        return h+t;
      }
    }
    return part("", (s ? s : ""));
  }

  // usage: i8n.escp("{strangename}");
  // escape the text
  // {xxx} -> {{xxx}} the escape
  function escp(s){
    // _log("_escp:"+s);
    function part(h, t){
      var b = t.indexOf("{");
      var e = t.indexOf("}", b);
      if (e > b && e != -1 && b != -1) {
        var h2 = h+t.substr(0, b)+"{{"+t.substr(b+1, e-b-1)+"}}";
        var t2 = t.substr(e+1, t.length-e-1);
        return part(h2, t2);
      } else {
        return h+t;
      }
    }
    return part("", (s ? s : ""));
  }

  // the file of url
  function file(sn){
    var a = sn.split('_');
    return (a.length >= 2) ? [a[0], a[1]].join('_') : sn;
  }

  // load process
  function load(name, sn, fn){
    var len = 0;
    function check(){ len--; if(len <= 0) fn(); }
    function loadp(name, sn){
      $.getJSON(file(sn)+"-zh_CN.js", function(json){ bind(sn, json); });
      $.get(file(sn)+".html", function(html){ $(name).append(html);check(); });
      // $.get(file(sn)+".css", function(css){ $(name).append(css); });
      // $.getScript(file(sn)+".js");
    }
    if (sn instanceof Array){
      len = sn.length; for(var i=0; i<sn.length; i++) loadp(name, sn[i]);
    } else if (typeof sn == "string") {
      len = 1; loadp(name, sn);
    }
  }

  // **** change current scene
  function go(url){
    var u = url.charAt(0) == "#" ? url.substring(1, url.length) : url;
    // _log("go('"+u+"')");
    // con.unbind(_scene()); // extra clean-up
    window.location.hash = u;
    window.location.reload(); // reload to trigger load fake href
  };

  // show sn's ui : trigger sn's display event
  function show(sn){
    $(document).trigger(sn);
  }

  // API EXPORT
  return {
    go:go,
    load:load,
    show:show,
    // bind:bind,
    // unbind:unbind,
    tran:tran,
    escp:escp
  };

})();


// **** playii connection object
if(!this.con) con = (function(){

  var host = "http://61.139.126.212:8880";
  // var host = "http://127.0.0.1:8880";
  var ourl = host+"/_open?c=?"; // 连接URL
  var rurl = host+"/_recv?c=?"; // 接收URL
  var surl = host+"/_send?c=?"; // 发送URL

  // ******** model
  var token = "";  // 通讯令牌
  var keep = false;// 连接状态
  var done = true; // (执行时)防重入
  var creg = {};   // 通道注册表
  var rbuf = [];   // 接收(待执行)队列
  var sbuf = [];   // 发送()

  // **** private funs

  function _keep(){
    if(keep) $(document).trigger("recv");
  }

  function _recv(event){ // event.data is the loop trigger
    if (!keep) return _err("recv:->err:not connect yet.");
    var nextf = event.data;
    var param = {t:token};
    // _log("recv:->");
    $.ajax({url:rurl, type:"GET", dataType:"json", cache:false, data:param,
      error: function(xhr, s, e){
        if(e) _err("recv:<-err:e:"+e+",s:"+s+","+xhr.responseText);
	// do not place next trigger, means exit the recv loop
      },
      success: function(d){
	// _log("recv:<-"+_src(d));
        if(! d instanceof Array) {
          _err("recv:<-err:bad format "+_src(d));
	  keep = false; // !!!! broken connect if recv failure
	  return;
	}
	for (var i = 0; i < d.length; i++) {
          var x = d[i];
          if (x !== undefined && x.length == 3) {
	    rbuf.push({s:x[0], f:x[1], a:x[2]});
	    _yield(_exec);
          } else {
            _err("recv:<-err:bad format "+_src(x));
          }
        }
        _yield(nextf); // place next trigger
      }
    });
  }

  function _exec() {
    if (! done) { _yield(_exec); return; }
    var c = rbuf.shift();
    if (rbuf.length > 0) _yield(_exec);
    if (c == undefined) return;
    try {
      done = false;
      if (creg[c.s] === undefined) {
        _err("exec: err: "+c.s+" not bind");
      } else if ( typeof(creg[c.s][c.f]) !== "function") {
        _err("exec: err: "+c.f+" not found");
      } else {
        creg[c.s][c.f].apply(creg[c.s], c.a);
        // _log("exec: success."+_src(c));
      }
    } catch(e) {
      _err("exec: err: "+e+":"+_src(c));
    } finally {
      done = true;
    }
  }

  function _send(param){
    if (!keep) return _err("send:->err:not connect yet.");
    param["t"] = token; // inject the token
    // _log("send:->"+_src(param));
    $.ajax({url:surl, type:"GET", cache:false, dataType:"json", data: param,
      error: function(xhr, s, e){
        if(e) _err("send:<-err:"+xhr.responseText);
	// keep = false;
      },
      success: function(d){
        // _log("send:<-ok");
      }
    });
  }

  // **** public

  // usage: con.open({}, options);
  // usage: con.open({id:str, nick:str}, options);
  //   options: {success:fun, failure:fun, go_identify:fun};
  function open(param, options){
    token = _cookie("token");
    if(token) param["t"] = token;
    // _log("open:->");
    $.ajax({url:ourl, type:"GET", dataType:"json", cache:false, data:param,
      error: function(xhr, s, e){
        if (s) _err("open:<-err:s:"+s+",e:"+e+",xhr:"+xhr.responseText);
      },
      success: function(d){
	// _log("open:<-");
        var r = d[0];
        if (r == "ok"){  // init receive loop
	  keep = true; token = d[1]; _cookie("token", d[1]);
	  // alert("p3p check!!! token:"+token+",cookie:"+_cookie("token"));
	  // jsonp will delay document ready event, load ui first
	  if (typeof(options["success"]) == "function") options["success"]();
	  // pass _keep to _recv as event.data -- the loop trigger
	  // _yield(function(){
	  $(document).bind("recv", _keep, _recv).trigger("recv");
	  // }, 1000);
	} else if (typeof(options[r]) == "function") {
          options[r]();
        } else if (typeof(options["failure"]) == "function") {
          options["failure"](r);
        }
      }
    });
  }

  // usage: con.bind("chat_main_1234", {callback:func})
  function bind(sn, obj){
    creg[sn] = obj;
  }

  // usage: con.unbind("chat_main_1234")
  function unbind(sn){
    delete creg[sn];
  }

  // usage: con.cast(scene)(func)(param1, param2);
  function cast(sn){
    sbuf = [];
    sbuf.push(sn);
    return _func;
  }
  function _func(func){
    sbuf.push(func);
    return _args;
  }
  function _args(){
    var args = [];
    for (var i = 0; i<arguments.length; i++) args.push(arguments[i]);
    sbuf.push(args);
    _send({s:sbuf[0], f:sbuf[1], a:sbuf[2]});
    sbuf = null;
  }

  // usage: con.close();
  function close(){
    // _log("close:->");
    keep = false;
    // _log("close:<-ok");
  }

  // API EXPORT
  return {
    open:open,
    bind:bind, unbind:unbind, cast:cast,
    close:close
  };

})();

