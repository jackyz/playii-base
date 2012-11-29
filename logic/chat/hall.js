(function(){

   // rand(max) : 生成不大于 max 的随机数
   function rand(max){
     return Math.floor(Math.random() * max);
   }

   // now() : 获取当前的时间戳
   function now(){
     return (new Date()).getTime();
   }

   // **** helper

   // view(ctx, who) : 生成 ctx 中 who 的可视部分(过滤不应被看到的数据)
   function view(ctx, who){
     return ctx; // todo
   }

   // broadcast(ctx) : 广播更新
   function broadcast(ctx){
     for(var u in ctx.ul) cast(u)("refresh")(u, view(ctx, u));
   }

   // return a function-as-an-object structure
   return mixin(
     // constructor
     function(parent, self){
       this.parent = parent;
       this.self = self;
       this.text = "default";
       this.ul = {};
       this.rl = {};
     },
     // methods
     {
       idle : function(){
	 debug("chat hall idle");
       },
       enter : function(who, nick, data){
	 this.ul[who] = {id:who, nick:nick};
	 broadcast(this);
       },
       leave : function(who){
	 delete this.ul[who];
	 broadcast(this);
       },
       refresh : function(who){
	 cast(who)("refresh")(who, view(this, who));
       },
       goroom: function(who, room){
	 if (! room in this.rl) { return debug("watch: bad room"); }
	 cast(who)("goroom")(room);
       },
       newroom : function(who, name){
	 var room = now();
	 var rurl = "chat_room_"+room;
	 this.rl[rurl] = name;
	 delete this.ul[who];
	 broadcast(this);
	 spawn(rurl)(rurl, name, who);
	 cast(who)("goroom")(rurl);
       },
       delroom : function(room){
	 delete this.rl[room];
	 broadcast(this);
       },
       test : function(rurl, what){
         this.text = this.rl[rurl] + "::" + what;
	 broadcast(this);
       },
       echo : function(who, what){
	 cast(who)("echo")(what, now());
       }
     }
   );

})();
