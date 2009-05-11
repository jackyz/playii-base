(function(){

   function idle(){
     debug("ruan main idle");
   }

   function enter(who, param, data){
     this.ul[who] = param;
     this.uc ++;
     pick.call(this, who);
   }

   function pick(who){
     var one = this.ll[who];
     if (one != undefined){
       error("pick:"+who+" double click?");
       return;
     }
     one = this.pl.shift();
     if (one == undefined){
       this.pl.push(who);
       debug("pick:"+who+" wait");
     } else {
       this.ll[who] = one;
       this.ll[one] = who;
       this.lc ++;
       cast(who)("bepick")(this.uc, this.lc, this.ul[one]);
       cast(one)("bepick")(this.uc, this.lc, this.ul[who]);
       debug("pick:"+who+" mate "+one);
     }
   }

   function talk(who, what){
     var one = this.ll[who];
     if (one == undefined){
       error("talk:"+who+" double click?");
     } else {
       cast(one)("betold")(what);
       debug("talk:"+who+" "+one+" "+what);
     }
   }

   function bore(who){
     var one = this.ll[who];
     if (one == undefined){
       error("bore:"+who+" double click?");
     } else {
       delete this.ll[who];
       delete this.ll[one];
       this.lc --;
       cast(one)("bebore")(this.uc, this.lc);
       debug("bore:"+who+" "+one);
     }
   }

   function leave(who){
     if(this.ll[who]) bore.call(this, who);
     this.uc --;
     delete this.ul[who];
   }

   return mixin(
     // constructor
     function(parent, self){
       this.parent = parent;
       this.self = self;
       this.ul = {}; // user list
       this.pl = []; // pick list
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
