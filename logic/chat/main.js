(function(){

   // shared private, constants
   function mask(ul){
     var nul = {};
     for(var n in ul) nul[n] = ul[n].nick;
     return nul;
   }

   // return a function-as-an-object structure
   return mixin(
     // the constructor
     function(x){
       this.parent = x; // init private
       this.ul = {}; // init properites
     },
     // the methods
     {
       idle: function(){
	 debug("idle");
       },
       refresh: function(who){
	 cast(who)("users_refresh")(who, mask(this.ul));
       },
       enter: function(who, nick, data){
	 debug("enter("+who+", "+nick+", "+data+")");
	 for (var u in this.ul) cast(u)("user_enter")(who, nick);
	 this.ul[who] = {id:who, nick:nick, data:data}; // 设置进入
	 cast(who)("user_welcome")(who, mask(this.ul));
       },
       leave: function(who){
	 delete this.ul[who];
	 for (var u in this.ul) cast(u)("user_leave")(who);
       },
       rename: function(who, name){
	 if (name == "fuck"){
	   cast(who)("error")("{dirty name}");
	 } else {
	   this.ul[who].nick = name;
	   for (var u in this.ul) cast(u)("user_rename")(who, name);
	 }
       },
       say: function(who, what){
	 if (what == "fuck"){
	   cast(who)("error")("{dirty words}");
	 } else {
	   for (var u in this.ul) if(u != who) cast(u)("msg_said")(who, what);
	 }
       },
       talk: function(who, whom, what){
	 cast(whom)("msg_told")(who, what);
       },
       echo:function(who, what){
	 debug("echo("+who+", "+what+")");
	 cast(who)("echo")(what, (new Date()).getTime());
       }
     }
   );

})();
