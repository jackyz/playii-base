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
    _ui().append("<ul id='players'>ready</ul>");
    _ui().append("<ul id='users'>users</ul>");
    _ui().append("<div id='cmd'></div>");
    if(LIST.member(u, v.pl)){
      _ui("#players").append("<li class='self'>"+v.ul[u].nick+"</li>");
      _ui("#cmd").text("<<<");
      _ui("#cmd").click( function(){ _unready(); } );
    }else{
      _ui("#users").append("<li class='self'>"+v.ul[u].nick+"</li>");
      _ui("#cmd").text(">>>");
      _ui("#cmd").click( function(){ _ready(); } );
    }
    for(var x in v.ul){
      if(x == u || LIST.member(x, v.pl)) continue;
      _ui("#users").append("<li>"+v.ul[x].nick+"</li>");
    }
    for(var y in v.pl){
      var w = v.pl[y];
      if(w == u || v.ul[w] == undefined) continue;
      _ui("#players").append("<li>"+v.ul[w].nick+"</li>");
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
