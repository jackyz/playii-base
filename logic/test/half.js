(function() {
   function now(){
     return (new Date()).getTime();
   }
   return mixin(function() {
     this.ul = {};
     this.wl = {};
   }, {
     idle : function(){
       debug("half :: idle()");
       var ts = now();
       for(var where in this.wl)
	 for(var who in this.wl[where])
	   if(ts - this.wl[where][who] > 45000){
	     debug("half :: idle() remove "+who+" from "+where);
	     delete this.wl[where][who];
	   }
     },
     enter : function(who, param, data) {
       debug("half :: enter("+who+","+param+","+data+")");
       this.ul[who] = {id:who, param:param, data:data};
     },
     poll : function(who, where) {
       debug("half :: poll("+who+","+where+")");
       if(!this.wl[where]) this.wl[where] = {};
       this.wl[where][who] = now();
     },
     push : function(where, fun, args) {
       debug("half :: push("+where+","+fun+","+args+")");
       if(this.wl[where]) for(var u in this.wl[where]) cast(u)(fun)(args);
     },
     leave : function(who) {
       debug("half :: leave("+who+")");
       for(var where in this.wl)
	 if(this.wl[where][who]) delete this.wl[where][who];
       delete this.ul[who];
     }
   });
})();