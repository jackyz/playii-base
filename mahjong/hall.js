$(function(){

  var _sn = _scene();

  // **** scene callback

  function debug(){
    var a=[]; for(var i=0; i<arguments.length; i++) a.push(arguments[i]);
    _log("debug("+a.join(",")+")");
  }

  function error(){
    var a=[]; for(var i=0; i<arguments.length; i++) a.push(arguments[i]);
    _log("error("+a.join(",")+")");
  }

  function echo(timelocal, timeserver){
    var now = (new Date()).getTime();
    _log("echo total:"+(now-timelocal)+"");
  }

  function refresh(u, v){
    redraw(u, v);
  }

  function go(url){
    _goto(url);
  }

  con.bind(_sn, {
    debug:debug,
    error:error,
    echo:echo,
    refresh:refresh,
    go:go
  });

  // **** scene api wrapper

  function _cast(f){    return con.cast(_sn)(f);    }
  function _enter(){    return _cast('enter')();    }
  function _leave(){    return _cast('leave')();    }
  function _refresh(){  return _cast('refresh')();  }
  function _ready(){    return _cast('ready')();    }
  function _unready(){  return _cast('unready')();  }

  // **** ui logic

  function _tran(s){ return ui.tran(_sn, s); }
  function _escp(s){ return ui.escp(s);      }
  function _ui(n){ return $("#root #hall"+(n?" "+n:"")); }

  function redraw(u, v){
    _ui().hide().empty();
    _ui().append("<ul id='face'></ul>");
    // self
    if(u in v.ul){
      _ui("#face").append("<li>"+v.ul[u].nick+"</li>");
      if(LIST.member(u, v.pl)){
	_ui("#face li:last").css("color", "red");
	_ui("#face li:last").click( function(){ _unready(); } );
      }else{
	_ui("#face li:last").css("color", "blue");
	_ui("#face li:last").click( function(){ _ready(); } );
      }
    }
    // ul & pl
    for(var x in v.ul){
      if(x == u) continue;
      _ui("#face").append("<li>"+v.ul[x].nick+"</li>");
      if(LIST.member(x, v.pl)){
	_ui("#face li:last").css("color", "red");
      }
    }
    _ui().show();
  }

  // **** ui test

  var view = {
    url : "/mahjong",
    ul : {
      "ua": {id:"ua", nick:"nicka"},
      "ub": {id:"ub", nick:"nickb"},
      "uc": {id:"uc", nick:"nickc"},
      "ud": {id:"ud", nick:"nickd"},
      "ue": {id:"ue", nick:"nicke"},
      "uf": {id:"uf", nick:"nickf"}
    },
    pl : ["ue", "uf"]
  };

  // redraw("ub", view);

  // autorun
  _yield(function(){ _enter(); }, 100);
  _yield(function(){ _refresh(); }, 300);
  _yield(function(){ _cast("enter_debug")(); }, 500);

});
