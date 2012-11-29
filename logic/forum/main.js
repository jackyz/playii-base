(function(){
   return mixin(
     function(parent, self){
       this.parent = parent;
       this.self = self;
       // --- logic special ---
       this.onlineuser = {};
       this.paticipant = {};
     },{
       idle  : function idle(){
	 debug("idle()");
	 var now = (new Date()).getTime();
	 for(var l in this.paticipant){
	   var p = this.paticipant[l];
	   if(p != undefined){
	     for(var u in p){
	       if (p[u] != undefined && now - p[u] > 15000) {
		 delete p[u];
		 for(var w in p) cast(w)("leave")(u);
	       }
	     }
	   }
	   this.paticipant[l] = p;
	 }
       },
       enter : function(who, param, data){
	 debug("enter("+who+","+param+","+data+")");
	 this.onlineuser[who] = {param:param, data:data};
       },
       online: function(who, where){
	 debug("online("+who+","+where+")");
	 var now = (new Date()).getTime();
	 var p = this.paticipant[where];
	 p = (p != undefined) ? p : {};
	 p[who] = now;
	 this.paticipant[where] = p;
	 for(var w in p) if(w != who) cast(w)("online")(who);
	 var u = []; for(var w in p) u.push(w); cast(who)("online_users")(u);
       },
       update: function(where, func, args){
	 debug("update("+where+","+what+")");
	 var p = this.paticipant[where];
	 if(p != undefined) for(var w in p) cast(w)(func)(args);
       },
       leave : function(who){
	 debug("leave("+who+")");
	 delete this.onlineuser[who];
	 for(var l in this.paticipant){
	   var p = this.paticipant[l];
	   if(p != undefined){
	     delete p[who];
	     for(var w in p) cast(w)("offline")(who);
	   }
	   this.paticipant[l] = p;
	 }
       }
     }
   );
})();
