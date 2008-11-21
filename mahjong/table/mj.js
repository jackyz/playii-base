$(function(){

  // **** constants

  var F = ["N", "E", "S", "W"];

  // **** handle events from secene

  var _sn = getScene();

  function debug(s){
    for(var i=0; i<arguments.length; i++)
    _server_log(arguments[i]);
  }

  function error(){
    var a = []; for(var i=0;i<arguments.length;i++) a.push(arguments[i]);
    _log("error("+a.join(",")+")");
  }

  function echo(timelocal, timeserver){
    var now = (new Date()).getTime();
    _log("echo total:"+(now-timelocal)+"");
  }

  function refresh(u, v){
    redraw(u, v); // trigger ui redraw
  }

  function user(cmd, u, nick){
    var a = []; for(var i=0;i<arguments.length;i++) a.push(arguments[i]);
    _log("user("+a.join(",")+")");
    if (cmd == "enter"){
    } else if (cmd == "leave"){
    }
  }

  function sit(){
    var a = []; for(var i=0;i<arguments.length;i++) a.push(arguments[i]);
    _log("sit("+a.join(",")+")");
  }

  function pai(){
    var a = []; for(var i=0;i<arguments.length;i++) a.push(arguments[i]);
    _log("pai("+a.join(",")+")");
  }

  con.bind(_sn, {
    debug:debug,
    error:error,
    echo:echo,
    refresh:refresh,
    user:user,
    sit:sit,
    pai:pai
  });

  // **** generate events to secene

  function _cast(f){    return con.cast(_sn)(f);    }
  function _enter(){    return _cast('enter')();    }
  function _leave(){    return _cast('leave')();    }
  function _refresh(){  return _cast('refresh')();  }
  function _sit(c,w){   return _cast('sit')(c,w);   }
  function _pai(c,p,q){ return _cast('pai')(c,p,q); }

  // **** ui utilities

  // 顺时针方向获取当前NEWS的顺位
  function _next(f){
    switch(f){
      case "E": return "S";
      case "S": return "W";
      case "W": return "N";
      case "N": return "E";
      default: return undefined;
    }
  }

  // self 恒为自己，据此对应NEWS到本地的上下左右
  function _lmap(f, lf){
    if (!lf) {
      // 未就坐 NEWS 对应
      switch(f){
	case "N": return "north";
	case "E": return "east";
	case "S": return "self";
	case "W": return "west";
	default: return undefined;
      }
    } else {
      // 已就坐 lf 对应 self 其他依次对应
      var cf=lf, c=0;
      do{
	if(cf==f) break;
	cf = _next(cf);
	c++;
      }while(c<4)
      switch(c){
	case 0: return "self";
	case 1: return "west";
	case 2: return "north";
	case 3: return "east";
	default: return undefined;
      }
    }
  }

  // **** ui shortcuts
  function _tran(s){ return ui.tran(_sn, s); }
  function _escp(s){ return ui.escp(s);      }
  function _ui(n){ return $('#main #game'+(n?" "+n:"")); }

  // **** ui logic

  // 画出当前牌局
  function redraw(u, v){

    // get my sit
    var f = LIST.first(function(x){ return v.sits[x].id == u; }, F);

    // clean bind
    _ui(".cmd").unbind();

    // redraw
    _ui().hide().empty();
    if (!v.play) draw_sits(f, v);
    else draw_play(f, v);
    _ui().show();

  }

  function draw_sits(f, v){

    // face/icon
    _ui().append("<ul id='face'></ul>");
    _ui().append("<ul id='icon'></ul>");
    LIST.foreach(function(x){
      var lf = _lmap(x);
      // icon
      if (v.sits[x].id && v.sits[x].ready){
	_ui("#icon").append("<li id='"+x+"' class='"+lf+" on'></li>");
      }else{
	_ui("#icon").append("<li id='"+x+"' class='"+lf+"'></li>");
      }
      // face
      if(v.sits[x].id){
	if(f != undefined && f == x){ // stand_up
	  _ui("#face").append("<li class='"+lf+" cmd'><img src='"+v.sits[x].id+"' width=32 height=32/></li>");
	  _ui("#face li:last").click( function(){ _sit("stand_up"); } );
	}else{
	  _ui("#face").append("<li class='"+lf+"'><img src='"+v.sits[x].id+"' width=32 height=32/></li>");
	}
      }else{
	if(f == undefined){ // sit_down
	  _ui("#face").append("<li class='"+lf+" cmd'></li>");
	  _ui("#face li:last").click( function(){ _sit("sit_down", x); } );
	}else{
	  _ui("#face").append("<li class='"+lf+"'></li>");
	}
      }
    }, F);

    // desk
    // _ui().append("<ul id='desk'>pick your sit.</ul>");

  }

  function draw_play(f, v){

    // face/icon
    _ui().append("<ul id='face'></ul>");
    _ui().append("<ul id='icon'></ul>");
    LIST.foreach(function(x){
      var lf = _lmap(x, f);
      _ui("#face").append("<li class='"+lf+"'><img src='"+v.sits[x].id+"' width=32 height=32/></li>");
      _ui("#icon").append("<li id='"+x+"' class='"+lf+"'></li>");
    }, F);
    // indicator
    if(v.game.turn) _ui("#icon #"+v.game.turn).addClass("on");
    _ui("#icon").append("<li id='host' class='"+_lmap(v.host, f)+"'></li>");

    // desk
    _ui().append("<ul id='desk'></ul>");
    LIST.foreach(function(x){
      _ui("#desk").append("<li><div id='m"+x+"'></div></li>");
    }, v.game.desk);

    // 4 side
    LIST.foreach(function(x){
      var xf = _lmap(x, f);
      _ui().append("<ul id='"+xf+"'></ul>");
      xf = "#"+ xf;
      // show
      LIST.foreach(function(y){
	_ui(xf).append("<li class='o'><div id='m"+y+"'></div></li>");
      }, v.game[x].show);
      _ui(xf).append("<li class='e'></li>");
      // hide
      LIST.foreach(function(y){
	_ui(xf).append("<li class='c'><div id='m"+y+"'></div></li>");
      }, v.game[x].hide);
      // hand
      _ui(xf).append("<li class='e'></li>");
      LIST.foreach(function(y){
	if(f == undefined){ // 非当前玩家
	  _ui(xf).append("<li class='"+(xf=="#self"?"c":"h")+"'></li>");
	}else if(f == v.game.turn && v.game.zhua){ // 当前玩家，抓牌
	  _ui(xf).append("<li class='h active cmd'><div id='m"+y+"'></div></li>");
	  _ui(xf+" li:last").click( function(){ _ui("#cmds").empty(); _pai("drop", y, false); } );
	}else{ // 当前玩家，非抓牌
	  _ui(xf).append("<li class='h'><div id='m"+y+"'></div></li>");
	}
      }, v.game[x].hand);
      _ui(xf).append("<li class='e'></li>");
      // ting
      if (v.game[x].ting) _ui(xf).append("<li class='t'></li>");
    }, F);
    // reverse east side
    _ui("#east li").prependTo("#game #east");

    // cmds
    _ui().append("<ul id='cmds'></ul>");
    if (f != undefined && f == v.game.turn){
      if(v.game.zhua){
	_ui("#cmds").append("<li id='h' class='active cmd'><div id=m"+v.game.card+"></div></li>");
	_ui("#cmds li:last").click( function(){ _ui("#cmds").empty(); _pai("drop", v.game.card); } );
      }else{
	_ui("#cmds").append("<li id='o' class='active'><div id=m"+v.game.card+"></div></li>");
	_ui("#cmds li:last").click( function(){ _ui("#cmds").empty(); _pai("hold"); } );
      }
      LIST.foreach(function(x){
	if (!x.option){
	  _ui("#cmds").append("<li id='"+x.cmd+"' class='cmd'></li>");
	  _ui("#cmds li:last").click( function(){ _ui("#cmds").empty(); _pai(x.cmd); } );
	}else{
	  LIST.foreach(function(y){
	    _ui("#cmds").append("<li id='"+x.cmd+"' class='cmd'></li>");
	    _ui("#cmds li:last").click( function(){ _ui("#cmds").empty(); _pai(x.cmd, y[0], y[1]); } );
	    var p1 = y[0];
	    var p2 = y[1];
	    _ui("#cmds li:last").mouseover(
	      function(){
		_ui("#self .h #m"+p1+":first").parent().css("margin-top", "-5px");
		_ui("#self .h #m"+p2+":first").parent().css("margin-top", "-5px");
	      }
	    ).mouseout(
	      function(){
		_ui("#self .h #m"+p1+":first").parent().css("margin-top", "0px");
		_ui("#self .h #m"+p2+":first").parent().css("margin-top", "0px");
	      }
	    );
	   }, x.option);
	}
      }, v.game.cmds);
    }

  }

  // **** test view data

  var view = {
    list: {
      ue: {id:'ue', nick:'east', data:200},
      us: {id:'us', nick:'south', data:20},
      uw: {id:'uw', nick:'west', data:400},
      un: {id:'un', nick:'north', data:50}
    },
    sits: {
      E: {id:'ue', ready:true},
      S: {id:'us', ready:true},
      W: {id:'uw', ready:true},
      N: {id:'un', ready:true}
    },
    play: true,
    // play datas
    host: 'E',
    game: {
      desk: [
	1,2,3,4,5,6,7,8,9,
	11,12,13,14,15,16,17,18,19,
	21,22,23,24,25,26,27,28,29,
	31,32,33,34,35,36,37
      ],
      trim: 0,
      E: {
	show: [11,12,13,14,15,16],
	hide: [18,18,18,18],
	hand: [21,22,23,28],
	ting: false
      },
      S: {
	show: [1,2,3],
	hide: [0,0,0,0],
	hand: [0,0,0,0,0,0,0],
	ting: true
      },
      W: {
	show: [21,22,23, 31,31,31],
	hide: [0,0,0,0],
	hand: [0,0,0,0],
	ting: true
      },
      N: {
	show: [1,2,3,7,8,9],
	hide: [0,0,0,0],
	hand: [0,0,0,0],
	ting: true
      },
      turn: 'E',
      card: 28,
      zhua: true,
      cmds: [
	{cmd:"gang"},
	{cmd:"peng"},
	{cmd:"shun"},
	{cmd:"ting"},
	{cmd:"hu"}
      ],
      info: {
	fang: "E",
	pais: [1,2,3,4,5,6,7,8,9,11,12,13,22,22],
	dian: 24,
	beta: -24
      }
    }
  };

  var view2 = {
    list: {
      ue: {id:'ue', nick:'east', data:200},
      us: {id:'us', nick:'south', data:20},
      uw: {id:'uw', nick:'west', data:400},
      un: {id:'un', nick:'north', data:50}
    },
    sits: {
      E: {id:undefined, ready:false},
      S: {id:"us", ready:true},
      W: {id:"uw", ready:false},
      N: {id:undefined, ready:false}
    },
    play: false
  };

  // _yield(function(){ refresh('ue', view); }, 500);

  _yield(function(){ _enter(); }, 100);
  _yield(function(){ _refresh(); }, 300);
  // DEBUG
  _yield(function(){ _cast("enter_debug")(); }, 500);

  /*
  // bind test ui callback
  $("#echo").click(function(){
    con.cast(_sn)("echo")((new Date()).getTime());
  });
  $("#refresh").click(function(){
    con.cast(_sn)("refresh")();
  });
  $("#sit_down").click(function(){
    var s = prompt("which sit? ESWN");
    con.cast(_sn)("sit")("sit_down", s);
  });
  $("#stand_up").click(function(){
    con.cast(_sn)("sit")("stand_up");
  });
  $("#ready").click(function(){
    con.cast(_sn)("sit")("ready");
  });
  $("#hule").click(function(){
    con.cast(_sn)("pai")("hule");
  });
  $("#gang").click(function(){
    con.cast(_sn)("pai")("gang");
  });
  $("#peng").click(function(){
    con.cast(_sn)("pai")("peng");
  });
  $("#shun").click(function(){
    var p1 = prompt("shun by p1?");
    var p2 = prompt("shun by p2?");
    con.cast(_sn)("pai")("shun", p1, p2);
  });
  $("#drop").click(function(){
    var p = prompt("drop which p?");
    var t = prompt("drop with ting?");
    con.cast(_sn)("pai")("drop", p, t);
  });
  $("#hold").click(function(){
    con.cast(_sn)("pai")("hold");
  });
   */

});
