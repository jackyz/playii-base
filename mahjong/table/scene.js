/*
 **** Big picture
 -----------------------------------------------------------------------------

 (where, arg1, arg2, ...)       <-- spawn(name, [arg1, arg2, ...]) // dad
 idle()                         <-- timeout // timer
 func(who, arg1, arg2, ...)     <-- cast(where)(func)(arg1, arg2, ...) //player
   * enter(who, nick, data)
   - enter_debug(who)
   * leave(who)
   - leave_debug(who)
   * refresh(who)
     any(who, arg1, arg2, ...)
 __func(where, arg1, arg2, ...) <-- async(where)(func)(arg1, arg2, ...) //scene
   * __end(where)               <-- end() // son

 -----------------------------------------------------------------------------

 **** APIs that scene should export

 return mixin(func, obj)
 idle()
 enter(who, nick, data)
 leave(who)
 refresh(who)
 any(who, arg1, arg2)
 _any(where, arg1, arg2)

 **** APIs that scene should use

 // 生成 func 和 object 的混合对象(用于定义"实例模版")
 mixin(func, object)

 // 发送调试信息，调用过 enter_debug 的用户能够收到
 debug(string), warn(string), info(string), error(string), fatal(string)

 // 调用 who(player) 的 func 函数，参数为 arg1, arg2, ...
 cast(who)(func)(arg1, arg2, ...)

 ** TODO **
 // 建立 where(scene)
 spawn(where, [arg1, arg2, ...])

 // 调用 where(scene) 的 func 函数，参数为 arg1, arg2, ...
 async(where)(func)(arg1, arg2, ...)

 // 退出(自身)
 end()

 */

(function(){

// ***************** CONSTS

   var F = ["E", "S", "W", "N"];     // 方位：东南西北

   var Z = [                         // 牌面
     1,2,3,4,5,6,7,8,9,              // 万
     11,12,13,14,15,16,17,18,19,     // 饼
     21,22,23,24,25,26,27,28,29,     // 索
     31,32,33,34,35,36,37            // 字
   ];

   var M = 3000;                     // 超时时间 3 秒

   var NF = function(a,b){return a-b;};

// ***************** LAYER 1 :: SCENE INTERFACE

   // ** 系统事件，自动调用
   // create(args) : 构造函数，定义数据结构，此处的 this 即为实例(数据)
   function create(args) {
     // 用户列表，所有在此房间的用户数据
     // {id:{id:id, nick:nick, data:data}, ...}
     // id: 玩家，nick: 昵称，data: 玩家-游戏数据
     this.list = {};
     // 座位状态
     // id: 玩家，ready: 就绪
     // 游戏中ready为false意味着用户离线
     // 未游戏中ready为false意味着用户还未准备开始游戏(比如，在看结果)
     this.sits = {
       E:{ id:undefined, ready:false },// 东
       S:{ id:undefined, ready:false },// 南
       W:{ id:undefined, ready:false },// 西
       N:{ id:undefined, ready:false } // 北
     };
     // 游戏中标志，true : 进行中
     this.play = false;
     // 消息，比如，胡牌结果
     this.info = undefined;
     // 庄家，哪一方玩家坐庄
     this.host = undefined;
     // 游戏数据，开局时初始化
     this.game = {};
   }

   // ** 系统事件，自动调用
   // idle() : 系统超时事件处理函数，
   function idle(){
     var t = now();
     if (this.play && (t - this.game.time > M)) { // 设置离线
       this.game.time = -1;
       do_call.call(this);
     }
     // else if (t - this.start_time > M) end_up();
   }

   // ** 系统事件，所有人可用
   // enter(who, nick, data) : 用户进入事件处理函数
   function enter(who, nick, data){
     //// cast(this.list)("user")("enter", who, nick); // 广播
     this.list[who] = {id:who, nick:nick, data:data}; // 设置进入
     var sit = get_sit(this, who);
     if (sit){ // 如果有坐
       if (this.play){ // 游戏中，设置 ready 为 true 以便不再跳过
	 this.sits[sit].ready = true;
       }
     }
     // broadcast.call(this); // mock
     // refresh.call(this, who); // 发送当前视图 // need change
   }

   // ** 系统事件，所有人可用
   // leave(who) : 用户离开事件处理函数
   function leave(who){
     delete this.list[who]; // 设置离开
     var sit = get_sit(this, who);
     if (sit){ // 如果有坐
       if (this.play){ // 游戏中，设置 ready 为 false 以便跳过
	 this.sits[sit].ready = false;
       } else { // 不在游戏中，设置离座
	 this.sits[sit] = {ready:false};
       }
     }
     //// cast(this.list)("user")("leave", who); // 广播
     broadcast.call(this); // mock
   }

   // ** 系统事件，场景内玩家可用
   // refresh(who) : 用户刷新事件处理函数
   function refresh(who){
     try {
       if (!this.list[who])
	 throw "{not in room}"; // 异常 不在场景内
       var sit = get_sit(this, who);
       var view = get_view(this, sit);
       cast(who)("refresh")(who, view); // 向用户发送
     } catch(e) {
       cast(who)("error")(e);
     }
   }

   // ** 游戏事件，场景内玩家可用
   // 对座位的可用操作
   // sit(who, "sit_down", arg);  坐下
   // sit(who, "stand_up");       起立
   // sit(who, "ready");          就绪
   function sit(who, cmd, arg){
     try {
       if (!this.list[who])
	 throw "{not in room}"; // 异常 不在房间
       if (this.play)
	 throw "{is playing}"; // 异常 游戏已开始
       // 执行命令
       switch(cmd){
	 case "sit_down": // ** 就座
  	   do_sit_down.call(this, who, arg); break;
	 case "stand_up": // ** 离座
  	   do_stand_up.call(this, who); break;
	 case "ready":    // ** 就绪
  	   do_ready.call(this, who); break;
	 default:
	   log("unknown sit command:"+cmd);
	   throw "{unknown sit command}"; // 异常
       }
     } catch(e) {
       cast(who)("error")(e);
     }
   }

   // ** 游戏事件，参与游戏的玩家可用
   // 对牌的可用操作
   // pai(who, "hule");           胡(完成)
   // pai(who, "gang");           杠
   // pai(who, "peng");           碰
   // pai(who, "shun", p1, p2);   吃(顺)
   // pai(who, "hold");           忍(扛)
   // pai(who, "drop", p, t);     打/停
   function pai(who, cmd, a1, a2){
     // bad(p) : 是否非法的牌，非法返回true
     function bad(p){
       return (p < 1 || p > 37 || p == 10 || p == 20 || p == 30);
     }
     // ****
     try {
       if (!this.list[who])
	 throw "{not in room}"; // 异常 不在房间
       if (!this.play)
	 throw "{not playing}"; // 异常 未开始
       var sit = get_sit(this, who);
       if (!sit)
	 throw "{not player}"; // 异常 不是玩家
       // 是否轮到 sit 操作
       if (this.game.turn != sit)
	 throw "{not your turn}"; // 异常 并未轮到
       // 执行命令
       switch(cmd){
	 case "hule": // ** 胡
	   do_hule.call(this, sit); break;
	 case "gang": // ** 杠
	   do_gang.call(this, sit); break;
	 case "peng": // ** 碰
	   do_peng.call(this, sit); break;
	 case "shun": // ** 吃(牌1,牌2)
	   var p1 = (isNaN(a1 - 0) ? 0 : a1 - 0).toFixed();
	   var p2 = (isNaN(a2 - 0) ? 0 : a2 - 0).toFixed();
	   if (bad(p1) || bad(p2))
	     throw "{invalidate arguments}";
	   do_shun.call(this, sit, p1, p2); break;
	 case "hold": // ** 忍
	   do_hold.call(this, sit); break;
	 case "drop": // ** 出牌(牌,停)
	   var p = (isNaN(a1 - 0) ? 0 : a1 - 0).toFixed();
	   var t = (a2 == "true" ? true : false);
	   if (bad(p))
	     throw "{invalidate arguments}";
	   do_drop.call(this, sit, p, t); break;
	 default:
	   log("unknown pai command:"+cmd);
	   throw "{unknown pai command}"; // 异常
       }
     } catch(e) {
       cast(who)("error")(e);
     }
   }

   // **** 测试事件
   function echo(who, what){
     debug("echo("+who+", "+what+")");
     cast(who)("echo")(what, now());
   }

   // **** 单元测试
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

// ***************** LAYER 2 :: ACTIONS

   // do_sit_down(who, sit) : 就座
   function do_sit_down(who, s){
     var sit = get_sit(this, who);
     if (sit)
       throw "{had sit already}"; // 异常 已经就座
     if (!member(s, F))
       throw "{sit not exist}"; // 异常 座位不合法
     if (this.sits[s].id)
       throw "{sit unavaliable}"; // 异常 座位有人
     this.sits[s] = {id:who, ready:false};  // 设置就坐
     //// cast(this.list)("sit")("sit_down", who, s); // 广播
     do_ready.call(this, who); // mock 直接 ready
   }

   // do_stand_up(who) : 离座
   function do_stand_up(who){
     var sit = get_sit(this, who);
     if (!sit)
       throw "{not sit yet}"; // 异常 尚未就座
     this.sits[sit] = {ready:false};  // 设置起身
     //// cast(this.list)("sit")("stand_up", who, sit); // 广播
     broadcast.call(this); // mock
   }

   // do_ready(who) : 就绪
   function do_ready(who){
     var sit = get_sit(this, who);
     if (!sit)
       throw "{not sit yet}"; // 异常 尚未就座
     this.sits[sit].ready = true;  // 设置就绪
     //// cast(this.list)("sit")("ready", who, sit); // 广播
     if(has_ready(this)) {
       do_open.call(this); // 若都已就绪，则开局
     }else{
       broadcast.call(this); // mock
     }
   }

   // do_hule(sit) : 胡了
   function do_hule(sit){
     if (!has_hule(this.game[sit].hand, this.game.card))
       throw "{hule failure}"; // 异常，未能成胡
     // info(this.game[sit].toSource()); // debug
     // TODO 算番结钱
     // 设置胡牌信息
     var p = [];
     p = p.concat(this.game[sit].show, this.game[sit].hide);
     p = p.concat(this.game[sit].hand, this.game.card);
     p.sort(NF);
     this.info = {
       time : now(),
       done : true,
       hule : p,
       side : sit
     };
     // 胡牌连庄，未胡轮庄
     this.host = (sit == this.host) ? sit : next(this.host);
     do_close.call(this); // 终局
   }

   // do_gang(sit) : 杠牌
   function do_gang(sit){
     // TODO 明杠，暗杠
     if (!has_gang(this.game[sit].hand, this.game.card))
       throw "{gang failure}"; // 异常 不能成杠
     // 设置杠牌
     this.game[sit].hand = remove(this.game.card, this.game[sit].hand);
     this.game[sit].hand = remove(this.game.card, this.game[sit].hand);
     this.game[sit].hand = remove(this.game.card, this.game[sit].hand);
     this.game[sit].show.push(this.game.card);
     this.game[sit].show.push(this.game.card);
     this.game[sit].show.push(this.game.card);
     this.game[sit].show.push(this.game.card);
     //// cast(this.list)("pai")("gang", sit, this.game.card); // 广播
     // 给 sit 发牌
     do_deal.call(this, sit, true);
   }

   // do_peng(sit) : 碰牌
   function do_peng(sit){
     if (!has_peng(this.game[sit].hand, this.game.card))
       throw "{peng failure}"; // 异常 不能成碰
     // 设置碰牌
     this.game[sit].hand = remove(this.game.card, this.game[sit].hand);
     this.game[sit].hand = remove(this.game.card, this.game[sit].hand);
     this.game[sit].show.push(this.game.card);
     this.game[sit].show.push(this.game.card);
     this.game[sit].show.push(this.game.card);
     // 设置 zhua 牌
     this.game[sit].hand.sort(NF);
     this.game.card = this.game[sit].hand.pop();
     this.game.zhua = true;
     this.game.turn = sit;
     //// cast(this.list)("pai")("peng", sit, this.game.card); // 广播
     // 叫牌
     do_call.call(this);
   }

   // do_shun(sit, p1, p2) : 吃牌
   function do_shun(sit, p1, p2){
     // is_shun : 是否成顺
     function is_shun(p1, p2, card){
       var a = []; a.push(card, p1, p2); a.sort(NF);
       if (a[0]-0+1 == a[1] && a[1]-0+1 == a[2]) return true;
       return false;
     }
     // ****
     if (this.game.card > 30)
       throw "{shun failure}"; // 异常 字牌
     if (!member(p1, this.game[sit].hand))
       throw "{shun failure}"; // 异常 没有此牌
     if (!member(p2, this.game[sit].hand))
       throw "{shun failure}"; // 异常 没有此牌
     if (!is_shun(p1, p2, this.game.card))
       throw "{shun failure}"; // 异常 不成顺
     // 设置吃牌
     this.game[sit].hand = remove(p1, this.game[sit].hand);
     this.game[sit].hand = remove(p2, this.game[sit].hand);
     var ps = []; ps.push(p1, p2, this.game.card); ps.sort();
     this.game[sit].show.push(ps[0]);
     this.game[sit].show.push(ps[1]);
     this.game[sit].show.push(ps[2]);
     // 设置 zhua 牌
     this.game[sit].hand.sort(NF);
     this.game.card = this.game[sit].hand.pop();
     this.game.zhua = true;
     this.game.turn = sit;
     //// cast(this.list)("pai")("shun", sit, ps); // 广播
     // 叫牌
     do_call.call(this);
   }

   // do_hold(sit) : 忍牌
   function do_hold(sit){
     if (this.game.zhua == true && this.game.turn == sit)
       throw "{hold failure}"; // 异常 轮到玩家出牌，不能忍
     // 叫牌 sit 的下家
     this.game.turn = next(sit);
     // 叫牌
     do_call.call(this);
   }

   // do_drop(sit, p, t) : 打牌，打出p，t === true 则意味着要求停牌
   function do_drop(sit, p, t){
     // 设置出牌
     if (this.game[sit].ting){
       if (p != this.game.card)
	 throw "{drop failure}"; // 异常 停牌时必打手中的牌
     } else {
       if (p == this.game.card){ // 打抓牌
	 // nop
       } else if (member(p, this.game[sit].hand)) { // 打手牌
	 this.game[sit].hand = remove(p, this.game[sit].hand);
	 this.game[sit].hand.push(this.game.card);
	 this.game[sit].hand.sort(NF);
       } else { // 既不是抓牌，也不是手牌
	 throw "{drop failure}"; // 异常 必打手牌或抓牌
       }
     }
     // 设置出牌
     this.game.last = sit;
     this.game.zhua = false;
     this.game.card = p;
     this.game.turn = next(sit);
     // 若要求停牌
     if (t === true) {
       if (!has_ting(this.game[sit].hand))
	 throw "{ting failure}"; // 异常，不能停
       // 设置停牌
       this.game[sit].ting = true;
       //// cast(this.list)("pai")("ting", sit); // 广播
     }
     //// cast(this.list)("pai")("drop", sit, p); // 广播
     // 叫牌
     do_call.call(this);
   }

// ***************** LAYER 2 :: ACTIONS :: GAME FLOW

   // do_open() : 开局
   function do_open(){
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
     // fpai : 分牌，从b中拿出c张牌
     function fpai(b, c){ // b : buff, c : count
       var p = [];
       for (var i=0; i<c; i++) p.push(b.shift());
       p.sort(NF); // 排序(不必要)
       return p;
     }
     // ****
     this.play = true;
     this.info = undefined; // 清除消息
     this.host = (!this.host) ? F[rand(4)] : this.host ; // 选庄
     //// cast(this.list)("pai")("open", this.host); // 广播
     var b = xpai();   // 洗牌
     this.game = {       // ** 游戏状态
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
     do_deal.call(this, this.host, false);
   }

   // do_deal(sit, tail) : 发牌，tail === true 杠牌发牌
   function do_deal(sit, tail){
     var p = 0;
     if (tail === true) { // 杠，从尾取
       p = this.game.buff.pop(); // 从 buff 尾取新牌
       this.game.trim++;
     } else { // 正常取
       p = this.game.buff.shift(); // 从 buff 头取新牌
     }
     if (!p) { // 牌已发完，牌局终止(流局)
       this.host = next(this.host); // 未胡轮庄
       this.info = { // 设置流局信息
	 time : now(),
	 done : false
       };
       do_close.call(this); // 终局
     } else { // 牌未发完，牌局继续
       this.game.card = p;    // 设置牌面
       this.game.zhua = true; // 设置抓牌
       this.game.turn = sit;
       // 叫牌
       do_call.call(this);
     }
   }

   // do_call() : 叫牌，用户完成选择之后的流程处理
   function do_call(){
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
     if (this.game.turn == this.game.last) {
       // 已轮询完一周
       this.game.desk.push(this.game.card); // 设置废牌落地
       do_deal.call(this, next(this.game.turn), false); // 向 turn 的下家发牌
     } else if (this.sits[this.game.turn].ready == false
		|| this.game.time == -1) {
       // 离线或超时，自动处理
       this.game.time = now(); // 重设超时
       if (this.game.zhua) { // 抓牌，直接打出
	 do_drop.call(this, this.game.turn, this.game.card, false);
       } else { // 非抓牌，直接跳过
	 this.game.turn = next(this.game.turn);
	 do_call.call(this);
       }
     } else { // 在线，计算可选项
       this.game.cmds = spai(this.game[this.game.turn].hand,
			   this.game.card,
			   this.game.zhua);
       this.game.time = now(); // 重设超时
       if (this.game.zhua || this.game.cmds.length > 0) { // 抓牌，或有可选项
	 broadcast.call(this); // mock
       } else { // 无可选项：跳过，叫牌 turn 的下家
	 this.game.turn = next(this.game.turn);
	 do_call.call(this);
       }
     }
   }

   // do_close() : 清盘
   function do_close(){
     this.play = false; // 终局
     this.game = {}; // 清场
     reset_sits(this); // 重置座位
     broadcast.call(this); // mock
   }

// ***************** LAYER 2 :: ACTIONS :: BROADCAST

   // broadcast() : 向玩家广播
   function broadcast(){
     for(var who in this.list) {
       // 获取 who 对应的 sit
       var sit = get_sit(this, who);
       var view = get_view(this, sit);
       cast(who)("refresh")(who, view); // 向用户发送
     }
   }

// ***************** LAYER 3 :: GAME LOGIC

   // has_hule(hand, card) : 是否胡了
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

   // has_gang(hand, card) : 是否有杠
   function has_gang(hand, card){
     return (count(card, hand) == 3);
   }

   // has_peng(hand, card) : 是否有碰
   function has_peng(hand, card){
     return (count(card, hand) >= 2);
   }

   // has_ting(hand) : 是否成停
   function has_ting(hand){
     return any(function(e){ return has_hule(hand, e); }, Z);
   }

   // has_ready(self)
   function has_ready(self){
     return all(function(x){ return self.sits[x].ready == true; }, F);
   }

   // get_sit(self, who) : 获取用户所在的座位
   function get_sit(self, who){
     return first(function(x){ return self.sits[x].id == who; }, F);
   }

   // reset_sits(self) : 重置座位
   function reset_sits(self){
     foreach(function(x){
	       if (self.sits[x].ready == false){ // 如果座位离线
		 self.sits[x] = {ready:false};  // 设为无人
	       } else { // 如果座位在线
		 self.sits[x].ready = false; // 设为待开始
	       }
	     }, F);
   }

   // get_view(self, sit) : 获取用户的可视数据
   function get_view(self, sit){
     // mask(obj) : 加码处理
     function mask(obj){
       return {
	 show: obj.show,
	 hide: map(function(x){ return 0; }, obj.hide),
	 hand: map(function(x){ return 0; }, obj.hand),
	 ting: obj.ting
       };
     }
     // ****
     return {
       list: self.list,
       sits: self.sits,
       play: self.play,
       info: self.info,
       host: self.host,
       game: self.play == true ? {
	 desk: self.game.desk,
	 trim: self.game.trim,
	 E: "E" == sit ? self.game["E"] : mask(self.game["E"]),
	 S: "S" == sit ? self.game["S"] : mask(self.game["S"]),
	 W: "W" == sit ? self.game["W"] : mask(self.game["W"]),
	 N: "N" == sit ? self.game["N"] : mask(self.game["N"]),
	 turn: self.game.turn,
	 last: self.game.last,
	 zhua: self.game.turn == sit ? self.game.zhua : false,
	 card: self.game.turn == sit ? self.game.card : 0,
	 cmds: self.game.turn == sit ? self.game.cmds : []
       } : {}
     };
   }

// ***************** LAYER 4 :: UTILITY

   // now() : 获取当前时间戳
   function now(){
     return (new Date()).getTime();
   }

   // rand(max) : 生成不大于 max 的随机数
   function rand(max) {
     return Math.floor(Math.random() * max);
   }

   // next(fang) : 获取某个方位的顺位
   function next(fang){
     switch(fang){
       case "E": return "S";
       case "S": return "W";
       case "W": return "N";
       case "N": return "E";
       default: return undefined;
     }
   }

// ***************** LAYER 4 :: UTILITY :: LIST

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

// ***************** INTERFACE EXPORT

   return mixin (create, {
       idle: idle,
       enter: enter,
       leave: leave,
       refresh: refresh,
       sit: sit,
       pai: pai,
       echo: echo,
       test: test
   });

   // trigger change global exception
   // mahjong = ....;

})();
