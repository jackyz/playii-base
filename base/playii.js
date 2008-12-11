// playii js
// the common functions

// function _log(str){ $('#log').append(str+"<br/>"); }
// function _server_log(str){ $('#server_log').append(str+"<br/>"); }
function _log(str){ console.debug(str); }
function _server_log(str){ console.debug(str); }

function _yield(func, time) { window.setTimeout(func, time ? time : 50); }
function _err(str){ _yield( function(){ alert(str); } ); }

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

// playii js connection object
if(!this.con) con = (function(){

  // ******** model
  var keep = false;
  var token = "";
  var done = true;
  var objs = {};
  var cmds = [];

  // usage: con.open({t:token}, {success:fun, failure:fun, go_identify:fun});
  // usage: con.open({identify:identify, provider:provider},
  //          {success:fun, failure:fun, go_identify:fun});
  function open(param, callback){
    var url = "/_open";
    var t = _cookie("token");
    if (t && !param["t"]) param["t"] = t;
    // _log("open:->");
    $.ajax({url:url, type:"POST", dataType:"json", data: param,
      error: function(xhr, s, e){
        if (s) _log("open:<-err:s:"+s+",e:"+e+",xhr:"+xhr.responseText);
      },
      success: function(d){
        var r = d[0];
        if (r == "ok"){
	  // token = d[1];
	  _cookie("token", d[1]);
          _init(d[1]);
          if (typeof(callback["success"]) == "function") callback["success"]();
        } else {
          if (typeof(callback[r]) == "function") {
            callback[r]();
          } else if (typeof(callback["failure"]) == "function") {
            callback["failure"](r);
          }
        }
      }
    });
  }
  function _init(t){
    keep = true;
    token = t;
    $(document).bind("recv", _keep, _recv).trigger("recv");
  }
  function _keep(){
    if(keep) $(document).trigger("recv");
  }
  function _recv(event){
    var url = "/_recv";
    var func = event.data;
    // _log("recv:->");
    $.ajax({url:url, type:"POST", dataType:"json", data:{t:token},
      error: function(xhr, s, e){
        if(e) _err("recv:<-err:e:"+e+",s:"+s+","+xhr.responseText);
      },
      success: function(d){
        if(! d instanceof Array) {
          // _log("loop:<-undefined");
	  keep = false; // !!!! broken connect if recv failure
        } else {
          if (d.length > 0) _log("recv:<-"+d.toSource());
          for (var i = 0; i < d.length; i++) {
            var x = d[i];
            if (x !== undefined && x.length == 3) {
              _push({s:x[0], f:x[1], a:x[2]});
            } else {
              _log("recv:<-err:bad format "+x.toSource());
            }
          }
        }
        if(keep) _yield(func);
      }
    });
  }

  // usage: con.close();
  function close(){
    // _log("close:->");
    keep = false;
    // _log("close:<-ok");
  }

  //
  function _push(d) {
    cmds.push(d);
    _yield(_exec);
  }

  //
  function _exec() {
    if (! done) { _yield(_exec); return; }
    var c = cmds.shift();
    if (cmds.length > 0) _yield(_exec);
    if (c == undefined) return;
    try {
      done = false;
      if (objs[c.s] === undefined) {
        _log("exec: err: "+c.s+" not bind");
      } else if ( typeof(objs[c.s][c.f]) !== "function") {
        _log("exec: err: "+c.f+" not found");
      } else {
        objs[c.s][c.f].apply(objs[c.s], c.a);
        _log("exec: success."+c.toSource());
      }
    } catch(e) {
      _log("exec: err: "+e+":"+c.toSource());
    } finally {
      done = true;
    }
  }

  // usage: con.bind("/chat/room/1234", {callback:func})
  function bind(sn, obj){
    objs[sn] = obj;
  }

  // usage: con.unbind("/chat/room/1234")
  function unbind(sn){
    delete objs[sn];
  }

  //
  var cmdline = null;
  // usage: con.cast(scene)(func)(param1, param2);
  function cast(sn){
    cmdline = [];
    cmdline.push(sn);
    return _func;
  }
  function _func(func){
    cmdline.push(func);
    return _args;
  }
  function _args(){
    var args = [];
    for (var i = 0; i<arguments.length; i++) args.push(arguments[i]);
    cmdline.push(args);
    _send({s:cmdline[0], f:cmdline[1], a:cmdline[2]});
    cmdline = null;
  }

  //
  function _send(req){
    if (!keep) {
      _log("send:->err:not connect yet.");
      return;
    }
    var url = "/_send";
    req["t"] = token; // inject the token
    _log("send:->"+req.toSource());
    $.ajax({url:url, type:"POST", dataType:"json", data: req,
      error: function(xhr, s, e){
        if(e) _err("send:<-err:"+xhr.responseText);
      },
      success: function(d){
        // _log("send:<-ok");
      }
    });
  }

  // API EXPORT
  return {
    open:open,
    bind:bind, unbind:unbind, cast:cast,
    close:close
  };

})();


// **** playii js ui object
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

  // the face html url of scene
  function face(sn){
    var a = sn.split('/');
    if (a.length == 2)      a[2] = "index.html";  // /chat -> /chat/index.html
    else if (a.length == 3) a[3] = "index.html";  // /chat/room -> /chat/room/index.html
    else if (a.length == 4) a[3] = "scene.html";  // /chat/room/1234 -> /chat/room/scene.html
    return a.join('/');
  }

  // the lang json url of scene
  function lang(sn){
    var lang = "zh_CN"; // TODO get from cookie or http header
    var a = sn.split('/');
    if (a.length == 2)      a[2] = "index-"+lang+".js";  // /chat -> /chat/index-zh_CN.js
    else if (a.length == 3) a[3] = "index-"+lang+".js";  // /chat/room -> /chat/room/index-zh_CN.js
    else if (a.length == 4) a[3] = "scene-"+lang+".js";  // /chat/room/1234 -> /chat/room/scene-zh_CN.js
    return a.join('/');
  }

  // load process
  function load(name, sn){
    // todo a deep unbind
    $(name).unbind();
    $(name).empty();
    // if (name.endWith(".html"))
    if (sn.lastIndexOf(".html") == (sn.length - ".html".length)){
      $(name).load(sn);
    } else {
      $.getJSON(lang(sn), function(json){ bind(sn, json); });
      $(name).load(face(sn));
    }
  }

  // API EXPORT
  return {
    load:load,
    // bind:bind,
    unbind:unbind,
    tran:tran,
    escp:escp
  };

})();

// **** the lib

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


