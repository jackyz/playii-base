(function(){

   // **** utility

   var $L = {
     // append(l, w) : 将 w 添加到 l
     append : function(l, w){
       l.push(w);
     },
     // remove(l, w) : 从 l 中去掉 w
     remove : function(l, w){
       var l2 = [];
       for(var i=0; i<l.length; i++) if(l[i] != w) l2.push(l[i]);
       return l2;
     },
     // foreach(l, f) : 对 l 逐个执行 f
     foreach : function(l, f){
       for(var i=0; i<l.length; i++) f(l[i]);
     }
   };

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

   // opentable : 新开一桌
   function opentable(ctx){
     var turl = ctx.self+"/table/"+now();
     spawn(turl)(turl, ctx.pl);
     $L.foreach(ctx.pl, function(x){
		  $L.remove(ctx.ul, x);
		  cast(x)("go")(turl);
		});
     ctx.pl = [];
   }

   // return a function-as-an-object structure
   return mixin(
     // constructor
     function(parent, self){
       this.parent = parent;
       this.self = self;
       this.ul = {};
       this.pl = [];
     },
     // methods
     {
       idle : function(){
	 debug("idle");
       },
       echo : function(who, what){
	 // debug("echo("+who+", "+what+")");
	 cast(who)("echo")(what, now());
       },
       enter : function(who, nick, data){
	 // debug("enter("+who+", "+nick+", "+data+")");
	 // for (var u in this.ul) cast(u)("enter")(who, nick);
	 this.ul[who] = {id:who, nick:nick};
	 broadcast(this);
       },
       refresh : function(who){
	 cast(who)("refresh")(who, view(this, who));
       },
       ready : function(who){
	 $L.append(this.pl, who);
	 if(this.pl.length >= 4) opentable(this); // 凑齐四人，新开一桌
	 broadcast(this);
       },
       unready : function(who){
	 this.pl = $L.remove(this.pl, who);
	 broadcast(this);
       },
       leave : function(who){
	 delete this.ul[who];
	 // for (var u in this.ul) cast(u)("leave")(who);
	 broadcast(this);
       }
     }
   );

})();
