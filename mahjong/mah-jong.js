(function(){

   // **** 常量

   var F = ["E", "S", "W", "N"];     // 方：东南西北

   var Z = [                         // 字
     1,2,3,4,5,6,7,8,9,              // 万
     11,12,13,14,15,16,17,18,19,     // 饼
     21,22,23,24,25,26,27,28,29,     // 索
     31,32,33,34,35,36,37            // 字
   ];

   var NF = function(a,b){return a-b;};

// ****************************************************************
// * TEST FUNCTIONS
// ****************************************************************

   function test() {

     var tm = {};

     void pass(tm);

     assert( xpai() != xpai());
     info("xpai :: success "+ pass(tm) +"ms");

     assert( has_gang([1,1,1], 1));
     assert( has_gang([1,1,1,2,3,5], 1));
     assert(!has_gang([1,1,2,3,5], 1));
     info("has_gang :: success "+ pass(tm) +"ms");

     assert( has_peng([1,1], 1));
     assert( has_peng([1,1,1], 1));
     assert( has_peng([1,1,1,6,7], 1));
     assert(!has_peng([1,2,3], 1));
     info("has_peng :: success "+ pass(tm) +"ms");

     assert( is_shun(1, 2, 3));
     assert(!is_shun(2, 3, 3));
     assert( is_shun(2, 4, 3));
     assert(!is_shun(3, 4, 3));
     assert( is_shun(4, 5, 3));
     assert(!is_shun(5, 6, 3));
     info("is_shun :: success "+ pass(tm) +"ms");

     assert( is_ting([1,2,2, 2,2,3, 21,21,21, 31,31,31, 37]) );
     info("is_ting :: success "+ pass(tm) +"ms");

   }

// ****************************************************************
// * EVENT FUNCTIONS
// ****************************************************************

  // **** 用户列表管理

   function enter(who, nick, data){
     cast(mj.list)("enter")(who, nick); // 广播
     mj.list[who] = {id:who, nick:nick, data:data}; // 设置进入
     cast(who)("welcome")(who, nick, data); // 欢迎
     refresh(who); // 刷新界面
   }

   function leave(who){
     delete mj.list[who]; // 设置离开
     cast(mj.list)("leave")(who); // 广播
   }

   function refresh(who){
     // 向用户发送场景状态信息
     // todo
     // cast(who)("refresh")(nl, gl, ul);
   }

   // ****
   // sit(who, "sit_down", s);
   // sit(who, "stand_up");
   // sit(who, "ready");
   function sit(who, cmd){
     try {
       if (!mj.list[who])
	 throw new Error("{not in room}"); // 异常 不在房间
       if (mj.play)
	 throw new Error("{is playing}"); // 异常 游戏已开始
       // 执行命令
       switch(cmd){
	 case "sit_down": // ** 就座
	   var s = arguments[2];  // 第三参数为座位
  	   do_sit_down(who, s); break;
	 case "stand_up": // ** 离座
  	   do_stand_up(who); break;
	 case "ready":    // ** 就绪
  	   do_ready(who); break;
	 default:
	   log("unknown sit command:"+cmd);
	   throw new Error("{unknown sit command}"); // 异常
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
   // pai(who, "drop", p);
   function pai(who, cmd){
     try {
       if (!mj.list[who])
	 throw new Error("{not in room}"); // 异常 不在房间
       if (!mj.play)
	 throw new Error("{not playing}"); // 异常 未开始
       // 获取 who 对应的 sit
       var sit = first(function(x){ return mj.sits[x].id == who; }, F);
       if (!sit)
	 throw new Error("{not player}"); // 异常 不是玩家
       // 是否轮到 sit 操作
       if (mj.game.turn != sit)
	 throw new Error("{not your turn}"); // 异常 并未轮到sit操作
       // 执行命令
       switch(cmd){
	 case "hule": // ** 胡
	   do_hule(sit); break;
	 case "gang": // ** 杠
	   do_gang(sit); break;
	 case "peng": // ** 碰
	   do_peng(sit); break;
	 case "shun": // ** 吃(牌1,牌2)
	   var p1 = arguments[2]; // 第三参数为第一个吃牌
	   var p2 = arguments[3]; // 第四参数为第二个吃牌
	   do_shun(sit, p1, p2); break;
	 case "hold": // ** 忍
	   do_hold(sit); break;
	 case "drop": // ** 出牌(牌,停)
	   var p = arguments[2]; // 第三参数为打出的牌
	   var t = arguments[3]; // 第四参数为停牌
	   do_drop(sit, p, t); break;
	 default:
	   log("unknown pai command:"+cmd);
	   throw new Error("{unknown pai command}"); // 异常
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
       // 得到 who 对应的 sit
       var sit = first(function(x){ return mj.sits[x].id == who; }, F);
       if (sit)
	 throw new Error("{had sit already}"); // 异常 已经就座
       if (!member(s, F))
	 throw new Error("{sit not exist}"); // 异常 座位不合法
       if (mj.sits[s].id)
	 throw new Error("{sit unavaliable}"); // 异常 座位有人
       mj.sits[s] = {id:who, ready:false};  // 设置就坐
       cast(mj.list)("sit")("sit_down", who, s); // 广播
   }

   // ****
   // do_stand_up : 离座
   function do_stand_up(who){
       // 得到 who 对应的 sit
       var sit = first(function(x){ return mj.sits[x].id == who; }, F);
       if (!sit)
	 throw new Error("{not sit yet}"); // 异常 尚未就座
       mj.sits[sit] = {};  // 设置起身
       cast(mj.list)("sit")("stand_up", who, sit); // 广播
   }

   // ****
   // do_ready : 就绪
   function do_ready(who){
       // 得到 who 对应的 sit
       var sit = first(function(x){ return mj.sits[x].id == who; }, F);
       if (!sit)
	 throw new Error("{not sit yet}"); // 异常 尚未就座
       mj.sits[sit].ready = true;  // 设置就绪
       cast(mj.list)("sit")("ready", who, sit); // 广播
       if(all(function(x){ return mj.sits[x].ready == true; }, F)) {
	 // 若都就绪则开局
	 do_open();
       }
   }

   // ****
   // do_open : 开局
   function do_open(){
     // if (!mj.host) mj.host = F[rand(4)]; // 选庄
     // mock
     mj.host = "E";
     cast(mj.list)("pai")("open", mj.host); // 广播开局
     mj.play = true;
     mj.game = init_game();
     // mj.game.buff = xpai(); // 洗牌
     // mock
     mj.game.buff = [36, 7, 32, 23, 37, 22, 32, 9, 36, 26, 27, 34, 35, 34, 17, 17, 5, 4, 19, 31, 32, 26, 31, 2, 16, 24, 33, 4, 27, 37, 8, 12, 6, 29, 18, 31, 26, 2, 29, 35, 5, 5, 8, 19, 7, 32, 22, 12, 28, 36, 26, 21, 33, 27, 21, 14, 8, 18, 14, 12, 28, 16, 35, 4, 13, 8, 22, 9, 11, 29, 25, 1, 25, 24, 15, 3, 11, 13, 18, 21, 19, 14, 15, 11, 33, 1, 24, 33, 18, 23, 13, 28, 6, 11, 23, 13, 14, 19, 27, 17, 25, 21, 22, 7, 29, 1, 23, 31, 16, 9, 6, 34, 17, 16, 3, 34, 15, 2, 15, 4, 25, 35, 36, 6, 37, 9, 7, 24, 5, 3, 12, 1, 2, 3, 28, 37];
     foreach(function(x){
	       // 分牌 // 每人13张
	       for (var i=0; i<13; i++)
		 mj.game[x].hand.push(mj.game.buff.shift());
	       // 排序(不必要)
	       mj.game[x].hand.sort(NF);
	       // 各自拿牌
	       cast(mj.sits[x].id)("pai")("init", mj.game[x].hand);
	     }, F);
     // 向庄家发牌
     do_deal(mj.host);
   }

   // ****
   // do_close : 清盘
   function do_close(hule, sit){
     if (hule) {
       if (sit != mj.host) mj.host = next(mj.host); // 胡牌连庄
       cast(mj.list)("pai")("hule", sit, mj.game[sit].show); // 广播胡牌
       // TODO 算番结钱
     } else {
       mj.host = next(mj.host); // 轮庄
       cast(mj.list)("pai")("fail"); // 广播流局
     }
     mj.game = init_game(); // 清场
     mj.play = false; // 终局
   }

   // ****
   // do_hule : 胡了
   function do_hule(sit){
     if (!has_hule(mj.game[sit].hand, mj.game.card))
       throw new Error("{hule failure}"); // 异常 不能成胡
     // 设置成胡
     mj.game[sit].show.push(mj.game.card);
     foreach(function(x){
	       mj.game[sit].show.push(x);
	     }, mj.game[sit].hand);
     mj.game[sit].hand = [];
     mj.game[sit].show.sort(NF);
     // debug
     info(mj.game[sit].toSource());
     // **** 成功,终局
     do_close(true, sit); // 终局
     // 不继续叫牌
   }

   // ****
   // do_gang : 杠牌
   function do_gang(sit){
     // TODO 明杠，暗杠
     if (!has_gang(mj.game[sit].hand, mj.game.card))
       throw new Error("{gang failure}"); // 异常 不能成杠
     // 设置杠牌
     mj.game[sit].hand = remove(mj.game.card, mj.game[sit].hand);
     mj.game[sit].hand = remove(mj.game.card, mj.game[sit].hand);
     mj.game[sit].hand = remove(mj.game.card, mj.game[sit].hand);
     mj.game[sit].show.push(mj.game.card);
     mj.game[sit].show.push(mj.game.card);
     mj.game[sit].show.push(mj.game.card);
     mj.game[sit].show.push(mj.game.card);
     // 设置 zhua 牌
     mj.game[sit].hand.sort(NF);
     mj.game[sit].zhua = mj.game[sit].hand.pop();
     // 广播杠牌
     cast(mj.list)("pai")("gang", sit, mj.game.card);
     // 清除打出的牌
     mj.game.card = 0;
     // 起杠
     do_deal(sit, true);
   }

   // ****
   // do_peng : 碰牌
   function do_peng(sit){
     if (!has_peng(mj.game[sit].hand, mj.game.card))
       throw new Error("{peng failure}"); // 异常 不能成碰
     // 设置碰牌
     mj.game[sit].hand = remove(mj.game.card, mj.game[sit].hand);
     mj.game[sit].hand = remove(mj.game.card, mj.game[sit].hand);
     mj.game[sit].show.push(mj.game.card);
     mj.game[sit].show.push(mj.game.card);
     mj.game[sit].show.push(mj.game.card);
     // 设置 zhua 牌
     mj.game[sit].hand.sort(NF);
     mj.game[sit].zhua = mj.game[sit].hand.pop();
     // 广播碰牌
     cast(mj.list)("pai")("peng", sit, mj.game.card);
     // 清除打出的牌
     mj.game.card = 0;
     // 叫牌 sit
     do_call(sit);
   }

   // ****
   // do_shun : 吃牌
   function do_shun(sit, p1, p2){
     if (mj.game.card > 30)
       throw new Error("{shun failure}"); // 异常 字牌
     if (!member(p1, mj.game[sit].hand))
       throw new Error("{shun failure}"); // 异常 没有此牌
     if (!member(p2, mj.game[sit].hand))
       throw new Error("{shun failure}"); // 异常 没有此牌
     if (!is_shun(p1, p2, mj.game.card))
       throw new Error("{shun failure}"); // 异常 不成顺
     // 设置吃牌
     mj.game[sit].hand = remove(p1, mj.game[sit].hand);
     mj.game[sit].hand = remove(p2, mj.game[sit].hand);
     var ps = []; ps.push(p1, p2, mj.game.card); ps.sort();
     mj.game[sit].show.push(ps[0]);
     mj.game[sit].show.push(ps[1]);
     mj.game[sit].show.push(ps[2]);
     // 设置 zhua 牌
     mj.game[sit].hand.sort(NF);
     mj.game[sit].zhua = mj.game[sit].hand.pop();
     // 广播吃牌
     cast(mj.list)("pai")("shun", sit, ps);
     // 清除打出的牌
     mj.game.card = 0;
     // 叫牌 sit
     do_call(sit);
   }

   // ****
   // do_hold : 忍牌
   function do_hold(sit){
     if (mj.game.turn == undefined)
       throw new Error("{hold failure}"); // 异常 轮到玩家出牌，不能忍
     // 叫牌 sit 的下家
     do_call( next(sit) );
   }

   // ****
   // do_drop : 打牌
   function do_drop(sit, p, t){
     // 设置出牌
     if (mj.game[sit].ting){
       if (p != mj.game[sit].zhua)
	 throw new Error("{drop failure}"); // 异常 停牌时必打手中的牌
     } else {
       if (p == mj.game[sit].zhua){ // 打抓牌
	 // nop
       } else if (member(p, mj.game[sit].hand)) { // 打手牌
	 mj.game[sit].hand = remove(p, mj.game[sit].hand);
	 mj.game[sit].hand.push(mj.game[sit].zhua);
	 mj.game[sit].hand.sort(NF);
       } else { // 既不是抓牌，也不是手牌
	 throw new Error("{drop failure}"); // 异常 必打手牌或抓牌
       }
     }
     // 清除抓牌
     mj.game[sit].zhua = 0;
     // 设置出牌
     mj.game.card = p;
     // 设置出牌人为自己
     mj.game.last = sit;
     // 广播出牌
     cast(mj.list)("pai")("drop", sit, p);
     // 叫牌 sit 的下家
     do_call( next(sit) );
     // 若要求停牌
     if (t) {
       if (!is_ting(mj.game[sit].hand))
	 throw new Error("{ting failure}"); // 异常，不能停
       // 设置停牌
       mj.game[sit].ting = true;
       // 广播停牌
       cast(mj.list)("pai")("ting", sit);
     }
   }

   // ****
   // do_deal : 发牌
   function do_deal(sit, tail){
     var card = 0;
     if (tail) { // 杠，从尾取
       card = mj.game.buff.pop(); // 从 buff 尾取新牌
       mj.game.trim++;
     } else { // 正常取
       card = mj.game.buff.shift(); // 从 buff 头取新牌
     }
     if (!card) { // 牌已发完，牌局终止(流局)
       do_close(false); // 终局
     } else { // 牌未发完，牌局继续
       mj.game[sit].zhua = card; // 将新牌发给 sit
       do_call(sit); // 对起牌玩家叫牌
     }
   }

   // ****
   // do_call : 叫牌,用户完成选择之后的流程处理
   function do_call(sit){
     mj.game.turn = sit;
     // info("do_call:: last="+mj.game.last+",turn="+mj.game.turn);
     if (mj.game[sit].zhua != 0) { // 当前玩家需要出牌
       // 计算可选项(抓牌)
       var cmds = spai(mj.game[sit].hand, mj.game[sit].zhua, true);
       // 要求 sit 作出选择 // 完成叫牌
       cast(mj.sits[sit].id)("pai")("take", mj.game[sit].hand, mj.game[sit].zhua, cmds);
     } else if (sit == mj.game.last) { // 已轮询完一周
       // 设置废牌落地
       mj.game.desk.push(mj.game.card);
       mj.game.card = 0;
       // 向 sit 的下家发牌
       do_deal( next(sit) );
     } else { // 轮询中
       var cmds = spai(mj.game[sit].hand, mj.game.card); // 计算可选项
       if (cmds.length == 1) { // 只有忍牌选项，跳过
	 // 跳过，叫牌 sit 的下家
	 do_call( next(sit) );
       } else {
	 // 要求sit选择
	 cast(mj.sits[sit].id)("pai")("hint", mj.game.card, cmds);
       }
     }
   }

// ****************************************************************
// * PRIVATE FUNCTIONS
// ****************************************************************

   // ****
   // xpai : 洗牌,生成一副麻将牌的随机组合
   function xpai() {
     var p = [];
     foreach(function(x){p.push(x);}, Z);
     foreach(function(x){p.push(x);}, Z);
     foreach(function(x){p.push(x);}, Z);
     foreach(function(x){p.push(x);}, Z);
     var k, t;
     for(var i=0; i<p.length; i++) {
       k = rand(p.length);
       t = p[i];
       p[i] = p[k];
       p[k] = t;
     }
     return p;
   }

   // ****
   // spai : 算牌,计算当前牌的可用选项
   function spai(hand, card, zhua){
     var cmds = [];
     if (zhua){ // 抓牌
       // 抓牌时有打牌选项
       cmds.push({cmd:"drop"});
       // 有胡
       if (has_hule(hand, card)) cmds.push({cmd:"hule"});
     } else {
       // 选牌时有忍牌选项
       cmds.push({cmd:"hold"});
       // 有胡
       if (has_hule(hand, card)) cmds.push({cmd:"hule"});
       // 有杠
       if (has_gang(hand, card)) cmds.push({cmd:"gang"});
       // 有碰
       if (has_peng(hand, card)) cmds.push({cmd:"peng"});
       // 有顺
       if (mj.game.card < 30) {
	 var p = clone(hand); p.push(card); p.sort(NF);
	 var r = [], i = indexof(card, p);
	 if (p[i-2] == card-2 && p[i-1] == card-1) r.push([p[i-2], p[i-1]]);
	 if (p[i-1] == card-1 && p[i+1] == card+1) r.push([p[i-1], p[i+1]]);
	 if (p[i+1] == card+1 && p[i+2] == card+2) r.push([p[i+1], p[i+2]]);
	 if (r.length != 0) cmds.push({cmd:"shun", option:r});
       }
     }
     return cmds;
   }

   // ****
   // has_hule : 是否胡了
   function has_hule(hand, card){
     var p = clone(hand); p.push(card); p.sort(NF);
     return is_hu(p);
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
   // is_ting : 是否成停
   function is_ting(hand){
     return any(function(e){ return has_hule(hand, e); }, Z);
   }

   // ****
   // is_shun : 是否成顺
   function is_shun(p1, p2, card){
     var a = []; a.push(card, p1, p2); a.sort(NF);
     if (a[0]+1 == a[1] && a[1]+1 == a[2]) return true;
     return false;
   }

   // ****
   // is_hu : 判断胡牌,p是牌数组,j是有将标志
   function is_hu(p, j){
     // debug("is_hu(["+p+"],"+j+")");
     if (p.length == 0) { // 没得剩
       if (j) return true; // 有将，胡了
       else return false; // 没将，不成胡
     }
     if (p[0] == p[1] && p[0] == p[2] && p[0] == p[3]){ // 有杠
       var px = clone(p); // 分支，提杠
       px.shift(); px.shift(); px.shift(); px.shift();
       if (is_hu(px, j)) return true; // 若成胡，成功
     }
     if (p[0] == p[1] && p[0] == p[2]){ // 有刻
       var px = clone(p); // 分支，提刻
       px.shift(); px.shift(); px.shift();
       if (is_hu(px, j)) return true; // 若成胡，成功
     }
     if (p[0] == p[1] && !j){ // 有将，且未提
       var px = clone(p); // 分支，提将
       px.shift(); px.shift();
       if (is_hu(px, true)) return true; // 若成胡，成功
     }
     if (p[0]<30 && member(p[0]+1, p) && member(p[0]+2, p)){ // 有顺
       var px = clone(p); // 分支，提顺
       px = remove(p[0], px); px = remove(p[0]+1, px); px = remove(p[0]+2, px);
       if (is_hu(px, j)) return true; // 若成胡，成功
     }
     return false; // 匹配完毕，失败
   }

   // -- utility

   function rand(max) {
     return Math.floor(Math.random() * max);
   }

   function next(fang){
     if (fang == "E") return "S";
     else if (fang == "S") return "W";
     else if (fang == "W") return "N";
     else if (fang == "N") return "E";
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
       if (func(array[i])) return array[i];
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
// * API & STATE
// ****************************************************************

   function init_sits(){
     return {          // ** 座位状态
       E:{                // 东
	 id:undefined,
	 ready:false
       },
       S:{                // 南
	 id:undefined,
	 ready:false
       },
       W:{                // 西
	 id:undefined,
	 ready:false
       },
       N:{                // 北
	 id:undefined,
	 ready:false
       }
     };
   }

   function init_game(){
     return {          // ** 游戏状态
       E:{                // 东
	 show:[],
         hide:[],
	 hand:[],
	 zhua:0,
	 ting:false
       },
       S:{                // 南
	 show:[],
         hide:[],
	 hand:[],
	 zhua:0,
	 ting:false
       },
       W:{                // 西
	 show:[],
         hide:[],
	 hand:[],
	 zhua:0,
	 ting:false
       },
       N:{                // 北
	 show:[],
         hide:[],
	 hand:[],
	 zhua:0,
	 ting:false
       },
       last:undefined,    // 上一个出牌人
       turn:undefined,    // 当前选择人
       card:0,            // 当前牌
       buff:[],           // 屯牌
       desk:[],           // 废牌
       trim:0             // 牌局杠牌次数
     };
   }

   var mj = {

     // ******** 状态

     // 用户列表
     list:{},          // ** 所有在此房间的用户数据
     // {id:{id:id, nick:nick, data:data}, ...}

     // 座位状态
     sits:init_sits(),

     // 运行标志
     play:false,       // ** 游戏中

     // 庄家
     host:undefined,      // 坐庄

     // 游戏状态
     game:init_game(),

     // ******** 事件

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

     test:test            // 测试

   };

   // trigger change global exception
   // mahjong = mj;

   return mj;

})();
