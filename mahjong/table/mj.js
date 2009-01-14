$(function(){

  // **** constants

  var F = ["N", "E", "S", "W"];

  // **** handle events from secene

  var _sn = _scene();

  function debug(s){
    for(var i=0; i<arguments.length; i++)
      _log(arguments[i]);
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

  // 获取方位的本地对应常见名称
  // south 恒为自己，据此对应NEWS到本地的上下左右
  function _lmap(f, lf){
    if (!lf) {
      // 未就坐，按 NEWS 对应
      switch(f){
	case "N": return "n";
	case "E": return "e";
	case "S": return "s";
	case "W": return "w";
	default: return undefined;
      }
    } else {
      // 已就坐，lf 对应 south 其他依次对应
      var cf=lf, c=0;
      do{
	if(cf==f) break;
	cf = _next(cf);
	c++;
      }while(c<4);
      switch(c){
	case 0: return "s";
	case 1: return "w";
	case 2: return "n";
	case 3: return "e";
	default: return undefined;
      }
    }
  }

  // **** ui shortcuts
  function _tran(s){ return ui.tran(_sn, s); }
  function _escp(s){ return ui.escp(s);      }
  function _ui(n){ return $('#root #game'+(n?" "+n:"")); }

  // **** ui logic
  var last_info_time = 0; // 上次显示的info信息，保留其时间戳，以避免重复显示

  // 一张牌
  // _pai(direct, state, val, extra, size)
  // _pai(direct, state, val, extra) size=default
  // _pai(direct, state, val) extra="" size=default
  // _pai(direct, state) val=0 extra="" size=default
  // direct : 朝向 news
  // state : 正面 0,1,2
  // val : 牌面， 0,1-9,11-19,21-29,31-37
  // extra : 附加class字符串
  // size : 尺寸 l,m,s
  function _pai(direct, state, val, extra, size){
    size = (size) ? size : "s";
    extra = (extra) ? " "+extra : "";
    return "<li"+
      (val ? " id='mj-"+val+"'" : "") +
      " class='mj-"+direct+"-b"+state+"-"+size+extra+"'>"+
      (val ? "<div class='mj-"+direct+"-"+val+"-"+size+"'/>" : "") +
      "</li>";
  }

  // 一个停牌标志
  // _ting(direct, size)
  // _ting(direct) size=default
  function _ting(direct, size){
    size = (size) ? size : "s";
    return "<li class='mj-"+direct+"-t-"+size+"'/>";
  }

  // 一个间隔
  // _spacer(size)
  // _spacer() size=default
  function _spacer(size){
    size = (size) ? size : "s";
    return "<li class='mj-e-"+size+"'/>";
  }

  // 一个方位图标
  // _fang(id, fang, state)
  // id : 定位id标记
  // fang : 显式方位名称，news
  // state : 是否高亮显式，bool
  function _fang(id, fang, state){
    return "<li id='"+id+"' class='mj-i-"+fang+(state ? " on" : "")+"'/>";
  }

  // 一个用户头像 // TODO 增加对头像的操作
  // _face(id, uid, extra)
  // _face(id, uid) extra=""
  // _face(id) uid=0
  function _face(id, uid, extra){
    return "<li id='"+id+"'"+(extra ? " class='"+extra+"'" : "")+">"+
      (uid ? "<img src='"+uid+"' width=32 height=32/>" : "") +
      "</li>";
  }

  // 一个做庄标记
  function _zhuang(id){
    return "<li id='h"+id+"' class='mj-i-h'/>";
  }

  // 一个选项标记
  function _option(cmd){
    return "<li class='mj-i-"+cmd+" cmd'/>";
  }

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

    // icon
    _ui().append("<ul id='icon'></ul>");
    LIST.foreach(function(x){
      var st = (v.sits[x].id && v.sits[x].ready);
      _ui("#icon").append(_fang(x, _lmap(x), st));
    }, F);

    // face
    _ui().append("<ul id='face'></ul>");
    LIST.foreach(function(x){
      if(v.sits[x].id){ // 此位有人
	if(f != undefined && f == x){ // 我坐此位，可以起来
	  _ui("#face").append(_face(x, v.sits[x].id, "cmd"));
	  _ui("#face li:last").click( function(){ _sit("stand_up"); } );
	}else{ // 我未坐此位
	  _ui("#face").append(_face(x, v.sits[x].id));
	}
      }else{ // 此位无人
	if(f == undefined){ // 我未就坐，可以坐下
	  _ui("#face").append(_face(x, 0, "cmd"));
	  _ui("#face li:last").click( function(){ _sit("sit_down", x); } );
	}else{ // 我已就坐
	  _ui("#face").append(_face(x));
	}
      }
    }, F);

    // info 有新的info信息需要显示
    if (v.sits[f] && v.sits[f].ready == true) return;
    if (!v.info || !v.info.time || v.info.time <= last_info_time) return;
    _ui().append("<ul id='info'></ul>");
    if (v.info.done === false) { // 流局
      _ui("#info").append("<ul id='hu'>流局</ul>");
      _ui("#info").append("<ul id='cmd'><li id='ok'>ok</li></ul>");
    }else{ // 胡牌
      _ui("#info").append("<ul id='hu'></ul>");
      LIST.foreach(function(x){
	_ui("#info #hu").append(_pai("s", 2, x));
      }, v.info.hule);
      _ui("#info").append("<ul id='cmd'></ul>");
      if(f){
	_ui("#info #cmd").append("<li id='continue'>continue</li>");
	_ui("#info #cmd").append("<li id='leave'>leave</li>");
      }else{
	_ui("#info #cmd").append("<li id='ok'>ok</li>");
      }
    }

    var info_time = v.info.time;
    // 显示 info 信息的继续函数
    var func_next = function(){
      var id = $(this).attr("id");
      switch(id){
	case "continue": _sit("ready"); break;
	case "leave": _sit("stand_up"); break;
      }
      last_info_time = info_time;
      _ui("#info").remove();
    };
    _ui("#info #cmd li").click(func_next);

  }

  function draw_play(f, v){

    // icon
    _ui().append("<ul id='icon'></ul>");
    LIST.foreach(function(x){
      _ui("#icon").append(_fang(_lmap(x,f), x, (v.game.turn == x)));
    }, F);
    // host indicator
    _ui("#icon").append(_zhuang(_lmap(v.host, f)));

    // face
    _ui().append("<ul id='face'></ul>");
    LIST.foreach(function(x){
      _ui("#face").append(_face(_lmap(x,f), v.sits[x].id));
    }, F);

    // desk
    _ui().append("<ul id='desk'></ul>");
    LIST.foreach(function(x){
      _ui("#desk").append(_pai("s", 2, x));
    }, v.game.desk);

    // 4 side
    _ui().append("<ul id='side'></ul>");
    LIST.foreach(function(x){
      var xf = _lmap(x, f);
      _ui("#side").append("<ul id='"+xf+"'></ul>");
      // show
      LIST.foreach(function(y){
	_ui("#side #"+xf).append(_pai(xf, 2, y, "o"));
      }, v.game[x].show);
      _ui("#side #"+xf).append(_spacer());
      // hide
      LIST.foreach(function(y){
	_ui("#side #"+xf).append(_pai(xf, 1, y, "h"));
      }, v.game[x].hide);
      _ui("#side #"+xf).append(_spacer());
      // hand
      LIST.foreach(function(y){
	if(xf == "s" && f == v.game.turn && v.game.zhua){ // 到我抓牌，手牌可弃
	  _ui("#side #"+xf).append(_pai(xf, 1, y, "h active cmd"));
	  _ui("#side #"+xf+" li:last").click(
	    function(){ _ui("#cmds").empty(); _pai("drop", y, false); } );
	}else{ // 非抓牌 或 未轮到我做决定，手牌不可弃，仅显示
	  // 我不在游戏中，南面的手牌显示为未开
	  var st = (f == undefined && xf == "s") ? 0 : 1;
	  _ui("#side #"+xf).append(_pai(xf, st, y, "h"));
	}
      }, v.game[x].hand);
      _ui("#side #"+xf).append(_spacer());
      // ting
      if (v.game[x].ting) _ui("#side #"+xf).append(_ting(xf));
    }, F);
    // 将东面的牌倒序显式
    _ui("#side #e li").prependTo(_ui("#side #e"));

    // cmds
    _ui().append("<ul id='cmds'></ul>");
    if (f != undefined && f == v.game.turn){
      if(v.game.zhua){
	_ui("#cmds").append(_pai("s", 1, v.game.card, "active cmd", "m"));
	_ui("#cmds li:last").click(
	  function(){ _ui("#cmds").empty(); _pai("drop", v.game.card); } );
      }else{
	_ui("#cmds").append(_pai("s", 2, v.game.card, "active cmd", "m"));
	_ui("#cmds li:last").click(
	  function(){ _ui("#cmds").empty(); _pai("hold"); } );
      }
      LIST.foreach(function(x){
	if (!x.option){
	  _ui("#cmds").append(_option(x.cmd));
	  _ui("#cmds li:last").click(
	    function(){ _ui("#cmds").empty(); _pai(x.cmd); } );
	}else{
	  LIST.foreach(function(y){
	    _ui("#cmds").append(_option(x.cmd));
	    _ui("#cmds li:last").click(
	      function(){
		_ui("#cmds").empty(); _pai(x.cmd, y[0], y[1]);
	      }
	    ).mouseover(
	      function(){
		_ui("#side #s #mj-"+y[0]+":first").css("margin-top", "-5px");
		_ui("#side #s #mj-"+y[1]+":first").css("margin-top", "-5px");
	      }
	    ).mouseout(
	      function(){
		_ui("#side #s #mj-"+y[0]+":first").css("margin-top", "");
		_ui("#side #s #mj-"+y[1]+":first").css("margin-top", "");
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
    // play: false,
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
	{cmd:"shun", option:[[21,22], [23,28]]},
	{cmd:"ting"},
	{cmd:"hu"}
      ]
    },
    info: {
      done: true,
      hule: [1,2,3,4,5,6,7,8,9,11,12,13,22,22]
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

  _yield(function(){ refresh('ue', view); }, 500);
/*
  _yield(function(){ _enter(); }, 100);
  _yield(function(){ _refresh(); }, 300);
  // DEBUG
  _yield(function(){ _cast("enter_debug")(); }, 500);
*/
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
