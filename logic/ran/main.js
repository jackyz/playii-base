(function(){

   function idle(){
   }

   function enter(who, param, data){
     this.ul[who] = param;
     this.uc ++;
     debug("enter:: "+who+" , "+param+" #"+this.uc);
     pick.call(this, who);
   }

   function pick(who){
     var one = this.ll[who];
     if (one == undefined){
       one = this.wu;
       if (one == undefined){
	 this.wu = who;
         debug("pick:: "+who+" wait");
       } else if(one != who){
	 this.wu = undefined;
         this.ll[who] = one;
         this.ll[one] = who;
         this.lc ++;
         cast(who)("bepick")(this.uc, this.lc, this.ul[one]);
         cast(one)("bepick")(this.uc, this.lc, this.ul[who]);
         debug("pick:: "+who+" - "+one+" #"+this.lc);
       }
     }
   }

   function talk(who, what){
     var one = this.ll[who];
     if (one != undefined){
       cast(one)("betold")(what);
       debug("talk:: "+who+" > "+one+" : "+what);
     } else {
       cast(one)("bebore")(this.uc, this.lc);
       debug("talk:: "+who+" bebore");
     }
   }

   function bore(who){
     var one = this.ll[who];
     if(one != undefined){
       this.lc --;
       delete this.ll[one];
       cast(one)("bebore")(this.uc, this.lc);
     }
     delete this.ll[who];
     debug("bore:: "+who+" x "+one+" #"+this.lc);
   }

   function leave(who){
     bore.call(this, who);
     if(this.wu == who) this.wu = undefined;
     delete this.ul[who];
     this.uc --;
     debug("leave:: "+who+" #"+this.uc);
   }

   return mixin(
     function(parent, self){
       this.parent = parent; // name of parent
       this.self = self; // name of self
       this.ul = {}; // user list
       this.wu = undefined; // wait user
       this.ll = {}; // link list
       this.uc = 0;  // user count
       this.lc = 0;  // link count
     },
     // methods
     {
       idle : idle,
       enter : enter,
       pick : pick,
       talk : talk,
       bore : bore,
       leave : leave
     }
   );

})();
