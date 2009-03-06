$(function(){

  var F = ["N", "W", "S", "E"]; // 常量，四个方位

  var _sn = _scene();

  // **** scene callback

  con.bind(_sn, {
    debug : function(){
      var a=[]; for(var i=0; i<arguments.length; i++) a.push(arguments[i]);
      _log("debug("+a.join(",")+")");
    },
    error : function(){
      var a=[]; for(var i=0; i<arguments.length; i++) a.push(arguments[i]);
      _log("error("+a.join(",")+")");
    },
    echo : function(timelocal, timeserver){
      var now = (new Date()).getTime();
      _log("echo total:"+(now-timelocal)+"");
    },
    refresh : function(u, v){
      _redraw(u, v);
    },
    go : function(url){
      _goto(url);
    }
  });

  // **** scene api wrapper

  function _cast(f){    return con.cast(_sn)(f);    }
  function _enter(){    return _cast('enter')();    }
  function _leave(){    return _cast('leave')();    }
  function _refresh(){  return _cast('refresh')();  }
  function _sitdown(r,s){ return _cast('sitdown')(r,s); }
  function _standup(){  return _cast('standup')();  }
  function _watch(r){   return _cast('watch')(r);    }

  // **** ui logic

  function _tran(s){ return ui.tran(_sn, s); }
  function _escp(s){ return ui.escp(s);      }
  function _ui(n){ return $("#root #hall"+(n?" "+n:"")); }

  function _redraw(u, v){
    // 是否坐了
    function _is_sit(u, v){
      for(var r in v.rl)
	for(var f in F)
	  if(v.rl[r].sits[F[f]] && v.rl[r].sits[F[f]] == u) return true;
      return false;
    }
    // 头像
    function _face(r, id, uid, on){
      var c = "", t = "", i = "", room=r;
      if (on && uid == u) c = "on self", t = "stand up";
      else if (on) c = "empty", t = "";
      else if (!uid) c = "on empty", t = "sit down";
      if (id == "V") t = "watch";
      if (uid) i = "<img src='"+uid+"' width=32 height=32/>";
      return "<li id='"+id+"' class='"+c+"' title='"+t+"' room='"+room+"'>"+i+"</li>";
    }
    // 房间
    function _room(id, room, on){
      var f = "";
      LIST.foreach(function(x){ f += _face(id, x, room.sits[x], on); }, F);
      if (room.play == true){
	f += _face(id, 'V', undefined, on); //
      }
      return "<ul id='"+id+"' class='room"+(room.play ? " play" : "")+"'>"+f+"</ul>";
    }
    //
    var on = _is_sit(u, v);
    _ui().hide().empty();
    _ui().append("<ul id='rooms'></ul>");
    _ui("#rooms").append(on ? "Wait for other players" : "Choose a sit");
    for(var r in v.rl)
      _ui("#rooms").append(_room(r, v.rl[r], on));
    _ui("#rooms li.on").click(function(){
      var c = $(this).attr("title");
      var r = $(this).attr("room");
      var s = $(this).attr("id");
      switch(c){
	case "sit down":
	  _sitdown(r,s); break;
	case "stand up":
	  _standup(); break;
	case "watch":
	  _watch(r); break;
	default:
	  alert("cmd:"+c+",room:"+r+",sit:"+s);
      }
    });
    _ui().show();
  }

/*
  // ui test
  var view = {
    ul:{
      "ua":{id:"ua", nick:"nicka"},
      "ub":{id:"ub", nick:"nickb"},
      "uc":{id:"uc", nick:"nickc"},
      "ud":{id:"ud", nick:"nickd"},
      "ue":{id:"ue", nick:"nicke"},
      "uf":{id:"uf", nick:"nickf"},
      "ug":{id:"ug", nick:"nickg"},
      "uh":{id:"uh", nick:"nickh"},
      "ui":{id:"ui", nick:"nicki"},
      "uj":{id:"uj", nick:"nickj"}
    },
    rl:{
      "id1": {
	play:true,
	sits:{
	  "N":"ua",
	  "W":"ub",
	  "S":"uc",
	  "E":"ud"
	}
      },
      "id2": {
	play:false,
	sits:{
	  "N":"uf",
	  "W":"ug",
	  "S":"uh"
	}
      }
    }
  };
  _redraw("ui", view);
*/

  // autorun
  _yield(function(){ _enter(); }, 100);
  _yield(function(){ _refresh(); }, 300);
  _yield(function(){ _cast("enter_debug")(); }, 500);

});
