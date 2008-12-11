(function(){

// ****************************************************************
// * CONSTS
// ****************************************************************

   var F = ["E", "S", "W", "N"];     // 方：东南西北

   var Z = [                         // 字
     1,2,3,4,5,6,7,8,9,              // 万
     11,12,13,14,15,16,17,18,19,     // 饼
     21,22,23,24,25,26,27,28,29,     // 索
     31,32,33,34,35,36,37            // 字
   ];

   var M = 3000;                     // 最长选择时间 3 秒

   var NF = function(a,b){return a-b;};

// ****************************************************************
// * TEST FUNCTIONS
// ****************************************************************

   function test() {

     var tm = {};

     void pass(tm);

     assert( has_gang([1,1,1], 1));
     assert( has_gang([1,1,1,2,3,5], 1));
     assert(!has_gang([1,1,2,3,5], 1));
     info("has_gang :: success "+ pass(tm) +"ms");

     assert( has_peng([1,1], 1));
     assert( has_peng([1,1,1], 1));
     assert( has_peng([1,1,1,6,7], 1));
     assert(!has_peng([1,2,3], 1));
     info("has_peng :: success "+ pass(tm) +"ms");

     assert( has_ting([1,2,2, 2,2,3, 21,21,21, 31,31,31, 37]) );
     info("has_ting :: success "+ pass(tm) +"ms");

   }

// ****************************************************************
// * BROADCAST
// ****************************************************************

   function broadcast(){
     var mj = this;
     for(var x in mj.list) refresh.call(mj, x);
   }

// ****************************************************************
// * EVENT FUNCTIONS
// ****************************************************************

  // **** 系统时间事件

   // ****
   // idle()
   function idle(){
     var mj = this;
     var t = now();
     if (mj.play && (t - mj.game.time > M)) { // 设置离线
       mj.game.time = -1;
       do_call.call(mj);
     }
     // else if (t - mj.start_time > M) end_up();
   }


  // **** 用户列表管理

   // ****
   // enter(who, nick, data);
   function enter(who, nick, data){
     var mj = this;
     //// cast(mj.list)("user")("enter", who, nick); // 广播
     mj.list[who] = {id:who, nick:nick, data:data}; // 设置进入
     // 得到 who 对应的 sit
     var sit = first(function(x){ return mj.sits[x].id == who; }, F);
     if (sit){ // 如果有坐
       if (mj.play){ // 游戏中，设置 ready 为 true 以便不再跳过
	 mj.sits[sit].ready = true;
       }
     }
     broadcast.call(mj); // mock
     // refresh.call(this, who); // 发送当前视图 // need change
   }

   // ****
   // leave(who);
   function leave(who){
     var mj = this;
     delete mj.list[who]; // 设置离开
     // 得到 who 对应的 sit
     var sit = first(function(x){ return mj.sits[x].id == who; }, F);
     if (sit){ // 如果有坐
       if (mj.play){ // 游戏中，设置 ready 为 false 以便跳过
	 mj.sits[sit].ready = false;
       } else { // 不在游戏中，设置离座
	 mj.sits[sit] = {ready:false};
       }
     }
     //// cast(mj.list)("user")("leave", who); // 广播
     broadcast.call(mj); // mock
   }

   // ****
   // refresh(who);
   function refresh(who){
     // ****
     // mask(obj);
     function mask(obj){
       return {
	 show: obj.show,
	 hide: map(function(x){ return 0; }, obj.hide),
	 hand: map(function(x){ return 0; }, obj.hand),
	 ting: obj.ting
       };
     }
     // ****
     var mj = this;
     try {
       if (!mj.list[who])
	 throw "{not in room}"; // 异常 不在房间
       // 获取 who 对应的 sit
       var sit = first(function(x){ return mj.sits[x].id == who; }, F);
       // 获取用户在场景中的可视部分
       var view = {
	 list: mj.list,
	 sits: mj.sits,
	 play: mj.play,
	 info: mj.info,
	 host: mj.host,
	 game: mj.play == true ? {
	   desk: mj.game.desk,
	   trim: mj.game.trim,
	   E: "E" == sit ? mj.game["E"] : mask(mj.game["E"]),
	   S: "S" == sit ? mj.game["S"] : mask(mj.game["S"]),
	   W: "W" == sit ? mj.game["W"] : mask(mj.game["W"]),
	   N: "N" == sit ? mj.game["N"] : mask(mj.game["N"]),
	   turn: mj.game.turn,
	   last: mj.game.last,
	   zhua: mj.game.turn == sit ? mj.game.zhua : false,
	   card: mj.game.turn == sit ? mj.game.card : 0,
	   cmds: mj.game.turn == sit ? mj.game.cmds : []
	 } : {}
       };
       cast(who)("refresh")(who, view); // 向用户发送
     } catch(e) {
       cast(who)("error")(e);
     }
   }

   // ****
   // sit(who, "sit_down", arg);
   // sit(who, "stand_up");
   // sit(who, "ready");
   function sit(who, cmd, arg){
     // debug("sit("+who+","+cmd+")");
     var mj = this;
     try {
       if (!mj.list[who])
	 throw "{not in room}"; // 异常 不在房间
       if (mj.play)
	 throw "{is playing}"; // 异常 游戏已开始
       // 执行命令
       switch(cmd){
	 case "sit_down": // ** 就座
  	   do_sit_down.call(mj, who, arg); break;
	 case "stand_up": // ** 离座
  	   do_stand_up.call(mj, who); break;
	 case "ready":    // ** 就绪
  	   do_ready.call(mj, who); break;
	 default:
	   log("unknown sit command:"+cmd);
	   throw "{unknown sit command}"; // 异常
       }
     } catch(e) {
       cast(who)("error")(e);
     }
   }

   // ****
   // pai : 打牌,被叫用户发来的选择消息
   // pai(who, "hule");
   // pai(who, "gang");
   // pai(who, "peng");
   // pai(who, "shun", p1, p2);
   // pai(who, "hold");
   // pai(who, "drop", p, t);
   function pai(who, cmd, a1, a2){
     // ****
     // bad(p);
     function bad(p){
       return (p < 1 || p > 37 || p == 10 || p == 20 || p == 30);
     }
     // ****
     var mj = this;
     try {
       if (!mj.list[who]) throw "{not in room}"; // 异常 不在房间
       if (!mj.play) throw "{not playing}"; // 异常 未开始
       // 获取 who 对应的 sit
       var sit = first(function(x){ return mj.sits[x].id == who; }, F);
       if (!sit) throw "{not player}"; // 异常 不是玩家
       // 是否轮到 sit 操作
       if (mj.game.turn != sit) throw "{not your turn}"; // 异常 并未轮到
       // 执行命令
       switch(cmd){
	 case "hule": // ** 胡
	   do_hule.call(mj, sit); break;
	 case "gang": // ** 杠
	   do_gang.call(mj, sit); break;
	 case "peng": // ** 碰
	   do_peng.call(mj, sit); break;
	 case "shun": // ** 吃(牌1,牌2)
	   var p1 = (isNaN(a1 - 0) ? 0 : a1 - 0).toFixed();
	   var p2 = (isNaN(a2 - 0) ? 0 : a2 - 0).toFixed();
	   if (bad(p1) || bad(p2)) throw "{invalidate arguments}";
	   do_shun.call(mj, sit, p1, p2); break;
	 case "hold": // ** 忍
	   do_hold.call(mj, sit); break;
	 case "drop": // ** 出牌(牌,停)
	   var p = (isNaN(a1 - 0) ? 0 : a1 - 0).toFixed();
	   var t = (a2 == "true" ? true : false);
	   if (bad(p)) throw "{invalidate arguments}";
	   do_drop.call(mj, sit, p, t); break;
	 default:
	   log("unknown pai command:"+cmd);
	   throw "{unknown pai command}"; // 异常
       }
     } catch(e) {
       cast(who)("error")(e);
     }
   }

// ****************************************************************
// * ACTION FUNCTIONS
// ****************************************************************

   // ****
   // do_sit_down : 就座
   function do_sit_down(who, s){
     var mj = this;
     // 得到 who 对应的 sit
     var sits = mj.sits;
     var sit = first(function(x){ return sits[x].id == who; }, F);
     if (sit) throw "{had sit already}"; // 异常 已经就座
     if (!member(s, F)) throw "{sit not exist}"; // 异常 座位不合法
     if (mj.sits[s].id) throw "{sit unavaliable}"; // 异常 座位有人
     mj.sits[s] = {id:who, ready:false};  // 设置就坐
     //// cast(mj.list)("sit")("sit_down", who, s); // 广播
     do_ready.call(mj, who); // mock 直接 ready
   }

   // ****
   // do_stand_up : 离座
   function do_stand_up(who){
     var mj = this;
     // 得到 who 对应的 sit
     var sit = first(function(x){ return mj.sits[x].id == who; }, F);
     if (!sit) throw "{not sit yet}"; // 异常 尚未就座
     mj.sits[sit] = {ready:false};  // 设置起身
     //// cast(mj.list)("sit")("stand_up", who, sit); // 广播
     broadcast.call(mj); // mock
   }

   // ****
   // do_ready : 就绪
   function do_ready(who){
     var mj = this;
     // 得到 who 对应的 sit
     var sit = first(function(x){ return mj.sits[x].id == who; }, F);
     if (!sit) throw "{not sit yet}"; // 异常 尚未就座
     mj.sits[sit].ready = true;  // 设置就绪
     //// cast(mj.list)("sit")("ready", who, sit); // 广播
     if(all(function(x){ return mj.sits[x].ready == true; }, F)) {
       do_open.call(mj); // 若都已就绪，则开局
     }else{
       broadcast.call(mj); // mock
     }
   }

   // ****
   // do_open : 开局
   function do_open(){
     // ****
     // xpai : 洗牌,生成一副麻将牌的随机组合
     function xpai() {
       var p = [];
       // 生成一副牌
       for(var i=0; i<4; i++) foreach(function(x){p.push(x);}, Z);
       // 乱序排列
       for(var i=0; i<p.length; i++) {
	 var k = rand(p.length);
	 var t = p[i];
	 p[i] = p[k];
	 p[k] = t;
       }
       return p;
     }
     // ****
     // fpai : 分牌，从b中拿出c张牌
     function fpai(b, c){ // b : buff, c : count
       var p = [];
       for (var i=0; i<c; i++) p.push(b.shift());
       p.sort(NF); // 排序(不必要)
       return p;
     }
     // ****
     var mj = this;
     mj.play = true;
     mj.info = undefined; // 清除消息
     mj.host = (!mj.host) ? F[rand(4)] : mj.host ; // 选庄
     //// cast(mj.list)("pai")("open", mj.host); // 广播
     var b = xpai();   // 洗牌
     mj.game = {       // ** 游戏状态
       buff:b,            // 余牌
       desk:[],           // 废牌
       trim:0,            // 牌局杠牌次数
       E:{ show:[], hide:[], hand:fpai(b, 13), ting:false }, // 东
       S:{ show:[], hide:[], hand:fpai(b, 13), ting:false }, // 南
       W:{ show:[], hide:[], hand:fpai(b, 13), ting:false }, // 西
       N:{ show:[], hide:[], hand:fpai(b, 13), ting:false }, // 北
       last:undefined,    // 上一个出牌人
       turn:undefined,    // 当前选择人
       time:now(),        // 当前选择开始时间
       card:0,            // 当前牌
       zhua:false,        // 抓牌标记(当前牌是抓来的)
       cmds:[]            // 可用命令(对当前牌的)
     };
     // 向庄家发牌
     do_deal.call(mj, mj.host, false);
   }

   // ****
   // do_deal : 发牌
   function do_deal(sit, tail){
     var mj = this;
     var p = 0;
     if (tail === true) { // 杠，从尾取
       p = mj.game.buff.pop(); // 从 buff 尾取新牌
       mj.game.trim++;
     } else { // 正常取
       p = mj.game.buff.shift(); // 从 buff 头取新牌
     }
     if (!p) { // 牌已发完，牌局终止(流局)
       mj.host = next(mj.host); // 未胡轮庄
       mj.info = { // 设置流局信息
	 time : now(),
	 done : false
       };
       do_close.call(mj); // 终局
     } else { // 牌未发完，牌局继续
       mj.game.card = p;    // 设置牌面
       mj.game.zhua = true; // 设置抓牌
       mj.game.turn = sit;
       // 叫牌
       do_call.call(mj);
     }
   }

   // ****
   // do_call : 叫牌,用户完成选择之后的流程处理
   function do_call(){
     // ****
     // find_shun : 寻找顺牌
     // result: 顺牌组合
     function find_shun(hand, card){
       var r = [], p = card;
       if (p < 30) {
	 if (member(p-2, hand)&&member(p-1, hand)) r.push([p-2, p-1]);
	 if (member(p-1, hand)&&member(p-0+1, hand)) r.push([p-1, p-0+1]);
	 if (member(p-0+1, hand)&&member(p-0+2, hand)) r.push([p-0+1, p-0+2]);
	 // info("find_shun() :: r:"+r.toSource());
       }
       return r;
     }
     // ****
     // spai : 算牌,计算当前牌的可用选项
     function spai(hand, card, zhua){
       var cmds = [];
       if (zhua){ // 抓牌
	 // 抓牌时有打牌选项
	 // cmds.push({cmd:"drop"});
	 // 有胡
	 if (has_hule(hand, card)) cmds.push({cmd:"hule"});
	 // 有停 TODO calculate so much, need think again
	 // if (has_ting(hand)) cmds.push({cmd:"ting"});
       } else {
	 // 选牌时有忍牌选项
	 // cmds.push({cmd:"hold"}); // 默认有
	 // 有胡
	 if (has_hule(hand, card)) cmds.push({cmd:"hule"});
	 // 有停 TODO calculate so much, need think again
	 // if (has_ting(hand)) cmds.push({cmd:"ting"});
	 // 有杠
	 if (has_gang(hand, card)) cmds.push({cmd:"gang"});
	 // 有碰
	 if (has_peng(hand, card)) cmds.push({cmd:"peng"});
	 // 有顺
	 var sr = find_shun(hand, card);
	 if (sr.length != 0) cmds.push({cmd:"shun", option:sr});
       }
       // info("spai(["+hand+"],"+card+","+zhua+") :: "+cmds.toSource());
       return cmds;
     }
     // ****
     var mj = this;
     if (mj.game.turn == mj.game.last) {
       // 已轮询完一周
       mj.game.desk.push(mj.game.card); // 设置废牌落地
       do_deal.call(mj, next(mj.game.turn), false); // 向 turn 的下家发牌
     } else if (mj.sits[mj.game.turn].ready == false || mj.game.time == -1) {
       // 离线或超时，自动处理
       mj.game.time = now(); // 重设超时
       if (mj.game.zhua) { // 抓牌，直接打出
	 do_drop.call(mj, mj.game.turn, mj.game.card, false);
       } else { // 非抓牌，直接跳过
	 mj.game.turn = next(mj.game.turn);
	 do_call.call(mj);
       }
     } else { // 在线，计算可选项
       mj.game.cmds = spai(mj.game[mj.game.turn].hand,
			   mj.game.card,
			   mj.game.zhua);
       mj.game.time = now(); // 重设超时
       if (mj.game.zhua || mj.game.cmds.length > 0) { // 抓牌，或有可选项
	 broadcast.call(mj); // mock
       } else { // 无可选项：跳过，叫牌 turn 的下家
	 mj.game.turn = next(mj.game.turn);
	 do_call.call(mj);
       }
     }
   }

   // ****
   // do_close : 清盘
   function do_close(){
     var mj = this;
     mj.play = false; // 终局
     mj.game = {}; // 清场
     foreach(function(x){
	       if (mj.sits[x].ready == false) mj.sits[x] = {ready:false};
	       else mj.sits[x].ready = false;
	     }, F); // 设置待开始
     broadcast.call(mj); // mock
   }

   // **** **** **** ****

   // ****
   // do_hule : 胡了
   function do_hule(sit){
     var mj = this;
     if (!has_hule(mj.game[sit].hand, mj.game.card))
       throw "{hule failure}"; // 异常 不能成胡
     // info(mj.game[sit].toSource()); // debug
     // TODO 算番结钱
     var p = [];
     p = p.concat(mj.game[sit].show, mj.game[sit].hide);
     p = p.concat(mj.game[sit].hand, mj.game.card);
     p.sort(NF);
     mj.info = { // 设置胡牌信息
       time : now(),
       done : true,
       hule : p,
       side : sit
     };
     // 胡牌连庄，未胡轮庄
     mj.host = (sit == mj.host) ? sit : next(mj.host);
     do_close.call(mj); // 终局
   }

   // ****
   // do_gang : 杠牌
   function do_gang(sit){
     var mj = this;
     // TODO 明杠，暗杠
     if (!has_gang(mj.game[sit].hand, mj.game.card))
       throw "{gang failure}"; // 异常 不能成杠
     // 设置杠牌
     mj.game[sit].hand = remove(mj.game.card, mj.game[sit].hand);
     mj.game[sit].hand = remove(mj.game.card, mj.game[sit].hand);
     mj.game[sit].hand = remove(mj.game.card, mj.game[sit].hand);
     mj.game[sit].show.push(mj.game.card);
     mj.game[sit].show.push(mj.game.card);
     mj.game[sit].show.push(mj.game.card);
     mj.game[sit].show.push(mj.game.card);
     //// cast(mj.list)("pai")("gang", sit, mj.game.card); // 广播
     // 给 sit 发牌
     do_deal.call(mj, sit, true);
   }

   // ****
   // do_peng : 碰牌
   function do_peng(sit){
     var mj = this;
     if (!has_peng(mj.game[sit].hand, mj.game.card))
       throw "{peng failure}"; // 异常 不能成碰
     // 设置碰牌
     mj.game[sit].hand = remove(mj.game.card, mj.game[sit].hand);
     mj.game[sit].hand = remove(mj.game.card, mj.game[sit].hand);
     mj.game[sit].show.push(mj.game.card);
     mj.game[sit].show.push(mj.game.card);
     mj.game[sit].show.push(mj.game.card);
     // 设置 zhua 牌
     mj.game[sit].hand.sort(NF);
     mj.game.card = mj.game[sit].hand.pop();
     mj.game.zhua = true;
     mj.game.turn = sit;
     //// cast(mj.list)("pai")("peng", sit, mj.game.card); // 广播
     // 叫牌
     do_call.call(mj);
   }

   // ****
   // do_shun : 吃牌
   function do_shun(sit, p1, p2){
     // ****
     // is_shun : 是否成顺
     function is_shun(p1, p2, card){
       var a = []; a.push(card, p1, p2); a.sort(NF);
       if (a[0]-0+1 == a[1] && a[1]-0+1 == a[2]) return true;
       return false;
     }
     // ****
     var mj = this;
     if (mj.game.card > 30)
       throw "{shun failure}"; // 异常 字牌
     if (!member(p1, mj.game[sit].hand))
       throw "{shun failure}"; // 异常 没有此牌
     if (!member(p2, mj.game[sit].hand))
       throw "{shun failure}"; // 异常 没有此牌
     if (!is_shun(p1, p2, mj.game.card))
       throw "{shun failure}"; // 异常 不成顺
     // 设置吃牌
     mj.game[sit].hand = remove(p1, mj.game[sit].hand);
     mj.game[sit].hand = remove(p2, mj.game[sit].hand);
     var ps = []; ps.push(p1, p2, mj.game.card); ps.sort();
     mj.game[sit].show.push(ps[0]);
     mj.game[sit].show.push(ps[1]);
     mj.game[sit].show.push(ps[2]);
     // 设置 zhua 牌
     mj.game[sit].hand.sort(NF);
     mj.game.card = mj.game[sit].hand.pop();
     mj.game.zhua = true;
     mj.game.turn = sit;
     //// cast(mj.list)("pai")("shun", sit, ps); // 广播
     // 叫牌
     do_call.call(mj);
   }

   // ****
   // do_hold : 忍牌
   function do_hold(sit){
     var mj = this;
     if (mj.game.zhua == true && mj.game.turn == sit)
       throw "{hold failure}"; // 异常 轮到玩家出牌，不能忍
     // 叫牌 sit 的下家
     mj.game.turn = next(sit);
     // 叫牌
     do_call.call(mj);
   }

   // ****
   // do_drop : 打牌
   function do_drop(sit, p, t){
     var mj = this;
     // 设置出牌
     if (mj.game[sit].ting){
       if (p != mj.game.card)
	 throw "{drop failure}"; // 异常 停牌时必打手中的牌
     } else {
       if (p == mj.game.card){ // 打抓牌
	 // nop
       } else if (member(p, mj.game[sit].hand)) { // 打手牌
	 mj.game[sit].hand = remove(p, mj.game[sit].hand);
	 mj.game[sit].hand.push(mj.game.card);
	 mj.game[sit].hand.sort(NF);
       } else { // 既不是抓牌，也不是手牌
	 throw "{drop failure}"; // 异常 必打手牌或抓牌
       }
     }
     // 设置出牌
     mj.game.last = sit;
     mj.game.zhua = false;
     mj.game.card = p;
     mj.game.turn = next(sit);
     // 若要求停牌
     if (t === true) {
       if (!has_ting(mj.game[sit].hand))
	 throw "{ting failure}"; // 异常，不能停
       // 设置停牌
       mj.game[sit].ting = true;
       //// cast(mj.list)("pai")("ting", sit); // 广播
     }
     //// cast(mj.list)("pai")("drop", sit, p); // 广播
     // 叫牌
     do_call.call(mj);
   }

// ****************************************************************
// * PRIVATE FUNCTIONS
// ****************************************************************

   // ****
   // has_hule : 是否胡了
   function has_hule(hand, card){
     // ****
     // is_hu : 判断胡牌,p是牌数组,j是有将标志
     function is_hu(p, j){
       // debug("is_hu(["+p+"],"+j+")");
       // 没得剩，且有将，则胡
       if (p.length == 0 && j === true) return true;
       // 有杠
       if (p[0] == p[1] && p[0] == p[2] && p[0] == p[3]){
	 var px = clone(p);
	 px.shift(); px.shift(); px.shift(); px.shift();
	 if (is_hu(px, j)) return true;
       }
       // 有刻
       if (p[0] == p[1] && p[0] == p[2]){
	 var px = clone(p);
	 px.shift(); px.shift(); px.shift();
	 if (is_hu(px, j)) return true;
       }
       // 有将，且未提
       if (p[0] == p[1] && j === false){
	 var px = clone(p);
	 px.shift(); px.shift();
	 if (is_hu(px, true)) return true;
       }
       // 有顺
       if (p[0]-0<30 && member(p[0]-0+1, p) && member(p[0]-0+2, p)){
	 var px = clone(p);
	 px = remove(p[0], px);
	 px = remove(p[0]-0+1, px);
	 px = remove(p[0]-0+2, px);
	 if (is_hu(px, j)) return true;
       }
       return false; // 无法匹配，失败
     }
     // ****
     var p = clone(hand); p.push(card); p.sort(NF);
     return is_hu(p, false);
   }

   // ****
   // has_gang : 是否有杠
   function has_gang(hand, card){
     return (count(card, hand) == 3);
   }

   // ****
   // has_peng : 是否有碰
   function has_peng(hand, card){
     return (count(card, hand) >= 2);
   }

   // ****
   // has_ting : 是否成停
   function has_ting(hand){
     return any(function(e){ return has_hule(hand, e); }, Z);
   }

   // -- utility

   function now(){
     return (new Date()).getTime();
   }

   function rand(max) {
     return Math.floor(Math.random() * max);
   }

   function next(fang){
     switch(fang){
       case "E": return "S";
       case "S": return "W";
       case "W": return "N";
       case "N": return "E";
       default: return undefined;
     }
   }

// ****************************************************************
// * LISTS FUNCTIONS
// ****************************************************************

   // ** func(e) return true | false
   function all(func, array){
     for (var i=0; i<array.length; i++){
       if (!func(array[i])) return false;
     }
     return true;
   }

   // ** func(e) return true | false
   function any(func, array){
     for (var i=0; i<array.length; i++){
       if (func(array[i])) return true;
     }
     return false;
   }

   function clone(array){
     var r = [];
     for (var i=0; i<array.length; i++){
       r.push(array[i]);
     }
     return r;
   }

   function count(e, array){
     var c = 0;
     for (var i=0; i<array.length; i++){
       if (e == array[i]) c++;
     }
     return c;
   }

   // ** func(e) return true | false
   function first(func, array){
     for (var i=0; i<array.length; i++){
       if (func.call(this, array[i])) return array[i];
     }
     return undefined;
   }

   // ** func(e) return void
   function foreach(func, array){
     for (var i=0; i<array.length; i++){
       func(array[i]);
     }
   }

   function indexof(e, array){
     for (var i=0; i<array.length; i++){
       if (array[i] == e) return i;
     }
     return -1;
   }

   // ** func(e) return true | false
   function last(func, array){
     for (var i=array.length - 1; i>0; i--){
       if (func(array[i])) return array[i];
     }
     return undefined;
   }

   // ** func(e) return new element
   function map(func, array){
     var r = [];
     for (var i=0; i<array.length; i++){
       r.push(func(array[i]));
     }
     return r;
   }

   function member(e, array){
     for (var i=0; i<array.length; i++){
       if (array[i] == e) return true;
     }
     return false;
   }

   function remove(e, array){
     var r = [], m = false;
     for (var i=0; i<array.length; i++){
       if (!m && array[i] == e) m = true;
       else r.push(array[i]);
     }
     return r;
   }

// ****************************************************************
// * EXPORT
// ****************************************************************

   // trigger change global exception
   // mahjong = mj;

   return {
     // ******** 状态

     // 用户列表
     list : {},          // ** 所有在此房间的用户数据
     // {id:{id:id, nick:nick, data:data}, ...}

     // 座位状态
     sits : {          // ** 座位状态
       E:{ id:undefined, ready:false },// 东
       S:{ id:undefined, ready:false },// 南
       W:{ id:undefined, ready:false },// 西
       N:{ id:undefined, ready:false } // 北
     },

     // 运行标志
     play : false,       // ** 游戏中

     // 消息
     info : undefined,   // ** 消息，比如，胡牌结果

     // 庄家
     host : undefined,    // 坐庄

     // 游戏数据
     game : {},           // 游戏数据

     // ******** 事件

     // ** 系统事件
     idle:idle,           // 时间函数

     // ** 所有人可用
     enter:enter,         // 进入
     leave:leave,         // 离开
     refresh:refresh,     // 刷新

     // ** 看客可用
     sit:sit,             // 对座位
     // **** 可用操作
     // sit_down    坐下
     // stand_up    起立
     // ready       就绪

     // ** 玩家可用
     pai:pai,             // 对牌
     // **** 可用操作
     // hule        胡(完成)
     // gang        杠
     // peng        碰
     // shun        吃(顺)
     // hold        忍(扛)
     // drop        打/停

     // ******** 测试
     echo:function(who, what){
       debug("echo("+who+", "+what+")");
       cast(who)("echo")(what, now());
     },

     // **** unit test
     test:test

   };

})();
