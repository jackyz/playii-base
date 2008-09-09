(function(){
   function refresh(who) {
     cast(who)("users_refresh")(who, this.ul);
   }
   function enter(who, nick, data) {
     for (var u in this.ul) cast(u)("user_enter")(who, nick);
     this.ul[who] = nick;
     cast(who)("user_welcome")(who, this.ul);
   }
   function leave(who) {
     delete this.ul[who];
     for (var u in this.ul) cast(u)("user_leave")(who);
   }
   function rename(who, name) {
     if (name == "fuck") { cast(who)("error")("{dirty name}"); return; }
     this.ul[who] = name;
     for (var u in this.ul) cast(u)("user_rename")(who, name);
   }
   function say(who, what) {
     debug("say("+who+" ,"+what+")");
     if (what == "fuck") { cast(who)("error")("{dirty words}"); return; }
     for (var u in this.ul) if(u != who) cast(u)("msg_said")(who, what);
   }
   function talk(who, whom, what) {
     debug("talk("+who+", "+whom+", "+what+")");
     cast(whom)("msg_told")(who, what);
   }
   function echo(who, what){
     debug("echo("+who+", "+what+")");
     cast(who)("echo")(what, (new Date()).getTime());
   }
   return {ul:{}, refresh:refresh, enter:enter, leave:leave, rename:rename, say:say, talk:talk, echo:echo};
})();
