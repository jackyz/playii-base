(function(){

   // **** constants

   var F = ["N", "W", "S", "E"]; // 常量，四个方位

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

   // where(ctx, who) : 获取who所在的room和sit
   function where(ctx, who){
     for(var r in ctx.rl)
       for(var f in F)
	 if(ctx.rl[r].sits[F[f]] && ctx.rl[r].sits[F[f]] == who)
	   return {room:r, sit:F[f]};
     return undefined;
   }

   // broadcast(ctx) : 广播更新
   function broadcast(ctx){
     for(var u in ctx.ul) cast(u)("refresh")(u, view(ctx, u));
   }

   // hall_full(ctx) : 是否已经满厅
   function hall_full(ctx){
     for(var r in ctx.rl)
       for(var f in F)
	 if(!ctx.rl[r].sits[F[f]])
	   return false;
     return true;
   }

   // table_new : 新建一桌
   function table_new(ctx){
     ctx.rl[""+now()] = { play:false, sits:{} };
   }

   // table_full(ctx, room) : 是否已经满桌
   function table_full(ctx, r){
     for(var f in F)
       if(!ctx.rl[r].sits[F[f]])
	 return false;
     return true;
   }

   // room_open : 开始一桌
   function room_open(ctx, room){
     var turl = "mahjong_room_"+room;
     var sits = ctx.rl[room].sits;
     for(var f in F){
       var w = sits[F[f]];
       delete ctx.ul[w]; // remove from hall // NEED THINK AGAIN
       cast(w)("go")(turl); // make client goto the table
     }
     debug("room_open("+turl+","+sits.toSource());
     spawn(turl)(turl, sits);
   }

   // return a function-as-an-object structure
   return mixin(
     // constructor
     function(parent, self){
       this.parent = parent;
       this.self = self;
       this.ul = {};
       this.rl = {};
       table_new(this);
     },
     // methods
     {
       idle : function(){
	 debug("mahjong hall idle");
       },
       echo : function(who, what){
	 cast(who)("echo")(what, now());
       },
       enter : function(who, nick, data){
	 this.ul[who] = {id:who, nick:nick};
	 broadcast(this);
       },
       refresh : function(who){
	 cast(who)("refresh")(who, view(this, who));
       },
       sitdown : function(who, room, sit){
	 if (! room in this.rl) { return debug("sitdown: bad room"); }
	 if ("NEWS".indexOf(sit) == -1){ return debug("sitdown: bad sit"); }
	 if (this.rl[room].sits[sit]){ return debug("sitdown: sited"); }
	 debug("sitdown:{room:\""+room+"\", sit:\""+sit+"\"}");
	 this.rl[room].sits[sit] = who;
	 if (table_full(this, room)) room_open(this, room); // 满桌，开始
	 if (hall_full(this)) table_new(this); // 满厅，新开
	 broadcast(this);
       },
       standup : function(who){
	 var w = where(this, who);
	 if (!w){ return debug("standup: where == undefined"); }
	 debug("standup:"+w.toSource());
	 delete this.rl[w.room].sits[w.sit];
	 broadcast(this);
       },
       watch: function(who, room){
	 if (! room in this.rl) { return debug("watch: bad room"); }
	 var turl = this.self+"/table/"+room;
	 cast(who)("go")(turl);
       },
       leave : function(who){
	 delete this.ul[who];
	 broadcast(this);
       }
     }
   );

})();
