(function(){

  // **** model
  var self = undefined;
  var users = {};
  var current = 'any';

  // **** the current Scene
  var _sn = getScene();

  function user_welcome(u, ul){
    _info("{Welcome},{your nickname are}:"+_span(u, ul[u].nick)+",{you can click and rename yourself}.");
    users_refresh(u, ul);
  }

  function users_refresh(u, ul){
    self = u;
    users = ul;
    _redraw(users);
  }

  function user_rename(u, n){
    if (u in users) {
      var oldn = users[u];
      users[u] = n;
      if (u == self) {
        _info("{I renamed to}:"+_span(u, n)+".");
      } else {
        _info(_span(u, oldn)+"{renamed to}:"+_span(u, n)+".");
      }
      _redraw(users);
    }
  }

  function user_enter(u, n){
    if(u in users) {
      // nothing
    } else {
      users[u] = n;
      _info(_span(u, n)+"{just come in}.");
      _redraw(users);
    }
  }

  function user_leave(u){
    if(u in users){
      var n = users[u];
      delete users[u];
      _info(_span(u, n)+"{has left}.");
      if(u == current) _select('any');
      _redraw(users);
    }
  }

  function msg_told(u, t){
    if(u in users && u != 'any'){
      _add(_span(u, users[u])+"{told me}:"+t);
    }
  }

  function msg_said(u, t){
    if(u in users && u != 'any'){
      _add(_span(u, users[u])+"{said}:"+t);
    }
  }

  function echo(time1, time2){
    var time3 = (new Date()).getTime();
    // _add("start:"+time1+",arrave:"+time2+",end:"+time3);
    _add("total:"+(time3-time1)+",network:"+(time2-time1)+"X2,server:"+((time3-time1)-(time2-time1)*2));
  }

  function error(t){
    _info(t);
  }

  function debug(str){
      _server_log(str);
  }

  // bind scene callbacks
  con.bind(_sn, {
    users_refresh:users_refresh,
    user_welcome:user_welcome,
    user_rename:user_rename,
    user_enter:user_enter,
    user_leave:user_leave,
    msg_told:msg_told,
    msg_said:msg_said,
    echo:echo,
    error:error,
    debug:debug
  });

  // scene api wrap functions
  function _cast(f){ return con.cast(_sn)(f); }
  function _refresh(){  _cast('refresh')();  }
  function _enter(){    _cast('enter')();    }
  function _leave(){    _cast('leave')();    }
  function _rename(n){  _cast('rename')(n);  }
  function _talk(n, w){ _cast('talk')(n, w); }
  function _say(w){     _cast('say')(w);     }
  function _echo(w){    _cast('echo')(w);    }

  // shortcut functions
  function _tran(s){ return ui.tran(_sn, s);  }
  function _escp(s){ return ui.escp(s);       }
  function _ui(n){ return $('#main #chat'+(n?" "+n:"")); }

  // _highlight(users);
  function _highlight(users) {
    function on_click_user(){
      _select($(this).attr('xid'));
    }
    _ui('.user').each(function (){
      $(this).unbind();
      var u = $(this).attr('xid');
      if (u in users || u == 'any') {
        if (u == self) {
          $(this).css({color:'red', cursor:'pointer'});
        } else {
          $(this).css({color:'green', cursor:'pointer'});
        }
        $(this).bind('click', on_click_user);
      } else {
        $(this).css({color:'gray', cursor:'text'});
      }
    });
  }

  // add text to text area (translate)
  // _add('text to add')
  function _add(text){
    // $('#words').append(text+"<br/>");
    _ui('#words').append(_tran(text)+"<br/>");
    _highlight(users);
  }
  // _info('text to info')
  function _info(text){
    _add("<span class='info'>"+text+"</span>");
  }

  // _span('abc', 'abc_nick')
  function _span(u, n){
    return "<span class='user' xid='"+u+"'>"+_tran(n)+"</span>";
  }

  // user_select('abc')
  function _select(u){
    current = (u in users) ? u : 'any';
    if (current == self) {
      _ui('#who_nick').hide();
      _ui("#rename").show();
    } else {
      var n = users[current] ? users[current] : '{every one}';
      _ui('#who_nick').show().text(_tran(n));
      _ui("#rename").hide();
    }
    _ui('#what')[0].focus();
  }

  // redraw the users list
  // _redraw(users);
  function _redraw(users){
    _ui('#users').hide();
    _ui('#users').empty();
    var len = 0;
    for(var u in users) len++;
    _ui('#users').append(_tran("{total}:"+len+"{person}")+"<br/>");
    if (self != undefined && users[self] != undefined) {
      _ui('#users').append("<li>"+_span(self, users[self].nick)+"</li>");
    }
    _ui('#users').append("<li>"+_span('any', '{every one}')+"</li>");
    for(var u in users) {
      if(u != self) _ui('#users').append("<li>"+_span(u, users[u])+"</li>");
    }
    _ui('#users').show();
    _highlight(users);
  }

  function on_click_send(){
    var what = _ui('#what').val();
    if (what == "") {
      // nothing
    } else if (current == self) {
      _rename(what);
      _select('any');
    } else if (current == 'any') {
      _say(what);
      _add("{I say}:"+what);
    } else if (current in users) {
      _talk(current, what);
      _add("{I talk}"+_span(current, users[current])+"{that}:"+what);
    } else {
      _info(_ui('#who_nick').text()+"{has left}.");
      _select('any');
    }
    _ui('#what').val('');
  }

  // bind ui callbacks
  // $('#send').bind('click', on_click_send);
  _ui('#what').keypress(function(k){ if(k.keyCode == 13) on_click_send(); });
  _ui('#refresh').bind('click', function(){ _refresh(); } );
  _ui('#rename').bind('click', function(){ on_click_send(); } );
  _ui('#clean').bind('click', function(){ _ui('#words').empty(); } );

  _yield(function(){ _enter(); }, 100);
  _yield(function(){ _refresh(); }, 300);
  _yield(function(){ _select('any') }, 500);

})();
