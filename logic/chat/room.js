(function(){

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
     function(parent, self, name, owner){
       this.parent = parent;
       this.self = self;
       this.name = name;
       this.owner = owner;
       this.ul = {};
     },
     // methods
     {
       idle : function(){
	 debug("chat room idle");
       },
       enter : function(who, nick, data){
	 this.ul[who] = {id:who, nick:nick};
	 broadcast(this);
       },
       leave : function(who){
	 function count(obj){
	   var i = 0;
	   for (var f in obj) i++;
	   return i;
	 }
	 delete this.ul[who];
	 if (count(this.ul) == 0) {
           debug("room empty, exit!!!");
	   async(this.parent)('delroom')();
	   endup();
	 } else {
	   broadcast(this);
	 }
       },
       refresh : function(who){
	 cast(who)("refresh")(who, view(this, who));
       },
       say : function(who, what){
	 for (var u in this.ul) if(u != who) cast(u)("say")(this.ul[u].nick, what);
       },
       test : function(who, what){
	 async(this.parent)('test')(this.ul[who].nick + ":" + what);
       },
       echo : function(who, what){
	 cast(who)("echo")(what, now());
       }
     }
   );

})();
