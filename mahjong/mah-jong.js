(function(){

// ****************************************************************
// * TEST FUNCTIONS
// ****************************************************************

   function test() {
     var t1 = (new Date()).getTime();
     // for (var i=0; i<1000; i++) xpai();
     var t2 = (new Date()).getTime();
     print("time:"+(t2-t1));
   }

// ****************************************************************
// * EVENT FUNCTIONS
// ****************************************************************

   // **** 常量

   var F = ["E", "S", "W", "N"];     // 方：东南西北

   var Z = [                         // 字
     1,2,3,4,5,6,7,8,9,              // 饼
     11,12,13,14,15,16,17,18,19,     // 索
     21,22,23,24,25,26,27,28,29,     // 万
     31,32,33,34,35,36,37            // 字
   ];

   // **** 用户列表管理

   function enter(who, nick, data){
     cast(this.list)("enter")(who, nick); // 广播
     this.list[who] = {id:who, nick:nick, data:data}; // 设置进入
     cast(who)("welcome")(who, nick, data); // 欢迎
     refresh(who); // 刷新界面
   }

   function leave(who){
     delete this.list[who]; // 设置离开
     cast(this.list)("leave")(who); // 广播
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
     if (!this.list[who]) return; // 若不在房间
     if (this.play) return;  // 若游戏已开始
     // 得到 who 对应的 sit
     var sit = first(function(x){ return this.sits[x].id == who; }, F);
     if (cmd == "sit_down") {  // ** 坐下
       if (sit) return;  // 若已就坐
       var s = arguments[2];  // 第三参数为座位
       if (this.sits[s].id) return; // 若座位有人
       this.sits[s] = {id:who, ready:false};  // 设置就坐
       cast(this.list)("sit")("sit_down", who, s); // 广播
     } else if (cmd == "stand_up") {  // ** 起身
       if (!sit) return; // 若未就坐
       this.sits[sit] = {};  // 设置起身
       cast(this.list)("sit")("stand_up", who, s); // 广播
     } else if (cmd == "ready") {  // ** 就绪
       if (!sit) return;  // 若未就坐
       this.sits[sit].ready = true;  // 设置就绪
       cast(this.list)("sit")("ready", who, s); // 广播
       if(all(function(x){ return this.sits[x].ready == true; }, F)) {
	 // 若都就绪则开局
	 this.play = true;
	 // **** 开局
	 // 选庄
	 if (!this.host) this.host = Feng[rand(4)];
	 cast(this.list)("pai")("start", this.host); // 广播开局
	 // 洗牌
	 this.game.buff = xpai();
	 // 分牌
	 foreach(function(x){
		   // 每人分牌12张
		   for (var i=0; i<12; i++)
		     this.game[x].hide.push(this.game.buff.shift());
		   cast(this.sits[x].id)("pai")("init", this.game[x].hide);
		 }, F);
	 // 庄家起牌
	 this.game[this.host].hide.push(this.game.buff.shift());
	 // 轮到庄家出牌
	 this.game.last = this.host;
	 this.game.turn = "";
	 // 叫牌
	 loop();
       }
     } else {  // ** 不能识别的命令
       log("unknow sit cmd:"+cmd);
     }
   }

   // ****
   // pai : 打牌,被叫用户发来的选择消息
   // pai(who, "done");
   // pai(who, "gang");
   // pai(who, "peng");
   // pai(who, "shun", p1, p2);
   // pai(who, "hold");
   // pai(who, "drop", p);
   function pai(who, cmd){
     if (!this.list[who]) return; // 若不在房间
     if (!this.play) return;  // 若游戏未开始
     // 获取 who 对应的 sit
     var sit = first(function(x){ return this.sits[x].id == who; }, F);
     if (!sit) return;  // 若未就坐
     // sit 是否被叫牌
     if (this.game.trun == "") { // 出牌中
       if (sit != this.game.last) return; // 若未轮到sit出牌
     } else { // 叫牌中
       if (sit != this.game.trun) return; // 若未轮到sit叫牌
     }
     if (cmd == "done") {  // ** 胡
       if (!is_done(this.game[sit].hide, this.game.card)) { // 算胡
	 cast(who)("error")("{error}"); // 通知
       } else { // 成胡
	 // **** 成功终局
	 var bill = do_bill(sit); // 算番/结钱 bill 是 object
	 if (this.host != sit) this.host = next(sit); // 轮庄
	 this.play = false; // 终局
	 cast(this.list)("pai")("done", bill); // 广播胡牌结果
	 return; // 没有必要继续叫牌
       }
     } else if (cmd == "gang") { // ** 杠
       if (!is_gang(this.game[sit].hide, this.game.card)) { // 算杠
	 cast(who)("error")("{error}"); // 通知
       } else { // 成杠
	 // 设置杠牌
	 this.game[sit].hide = delete(this.game.card, this.game[sit].hide);
	 this.game[sit].hide = delete(this.game.card, this.game[sit].hide);
	 this.game[sit].hide = delete(this.game.card, this.game[sit].hide);
	 this.game[sit].show.push(this.game.card);
	 this.game[sit].show.push(this.game.card);
	 this.game[sit].show.push(this.game.card);
	 this.game[sit].show.push(this.game.card);
	 this.game.card = "";
	 // 起杠
	 this.game[sit].hide.push(this.game.buff.pop());
	 this.game.trim++;
	 // 轮到 sit 出牌
	 this.game.last = sit;
	 this.game.turn = "";
	 // 广播杠牌
	 cast(this.list)("pai")("gang", sit, this.game.card);
       }
     } else if (cmd == "peng") { // ** 碰
       if (!is_peng(this.game[sit].hide, this.game.card)) { // 算碰
	 cast(who)("error")("{error}"); // 通知
       } else { // 成碰
	 // 设置碰牌
	 this.game[sit].hide = delete(this.game.card, this.game[sit].hide);
	 this.game[sit].hide = delete(this.game.card, this.game[sit].hide);
	 this.game[sit].show.push(this.game.card);
	 this.game[sit].show.push(this.game.card);
	 this.game[sit].show.push(this.game.card);
	 this.game.card = "";
	 // 轮到 sit 出牌
	 this.game.last = sit;
	 this.game.turn = "";
	 // 广播碰牌
	 cast(this.list)("pai")("peng", sit, this.game.card);
       }
     } else if (cmd == "shun") { // ** 吃
       var p1 = arguments[2]; // 第三参数为第一个吃牌
       var p2 = arguments[3]; // 第四参数为第二个吃牌
       if (!is_shun(p1, p2, this.game.card)) { // 算吃
	 cast(who)("error")("{error}"); // 通知
       } else { // 成顺
	 // 设置吃牌
	 this.game[sit].hide = delete(p1, this.game[sit].hide);
	 this.game[sit].hide = delete(p2, this.game[sit].hide);
	 this.game[sit].show.push(p1);
	 this.game[sit].show.push(p2);
	 this.game[sit].show.push(this.game.card);
	 this.game.card = "";
	 // 轮到 sit 出牌
	 this.game.last = sit;
	 this.game.turn = "";
	 // 广播吃牌
	 cast(this.list)("pai")("shun", sit, [p1, p2, this.game.card]);
       }
     } else if (cmd == "hold") { // ** 忍
       if (this.game.turn == "") { // 不能忍,玩家需要出牌
	 cast(who)("error")("{error}"); // 通知
       } else {
	 // 轮到下家叫牌
	 this.game.turn = next(sit);
       }
     } else if (cmd == "drop") { // ** 出牌(牌,停)
       var p = arguments[2]; // 第三参数为打出的牌
       var t = arguments[3]; // 第四参数为停牌
       if (this.game[sit].ting == true && !member(p, this.game[sit].hide)) {
	 // 停牌,则必打 hold 的牌
	 cast(who)("error")("{error}"); // 通知
       } else {
	 // 设置出牌
	 this.game[sit].hide = delete(p, this.game[sit].hide);
	 this.game.card = p;
	 // 轮到 sit 的下家叫牌
	 this.game.last = sit;
	 this.game.turn = next(sit);
	 // 广播出牌
	 cast(this.list)("pai")("drop", sit, p);
	 // 若要求停牌
	 if (t) {
	   if (!is_ting(this.game[sit])) { // 算停
	     cast(this.next)("error")("{error}"); // 通知
	   } else { // 停牌
	     // 设置停牌
	     this.game[sit].ting = true;
	     // 广播停牌
	     cast(this.list)("pai")("ting", sit);
	   }
	 }
       }
     } else {
       log("unknow pai cmd:"+cmd);
     }
     // 叫牌
     loop();
   }

// ****************************************************************
// * LOGIC FUNCTIONS
// ****************************************************************

   // ****
   // loop : 叫牌,用户完成选择之后的流程处理
   function loop(){
     if (this.game.turn == "") { // 尚未开始轮询,等待打出
       var sit = this.game.last; // sit 是 last
       var cmds = calc_cmds(this.game[sit], this.game.card); // 计算可选项
       cmds.push("drop"); // sit 有打牌选项
       // 要求 sit 作出选择 // 完成叫牌
       cast(this.sits[sit].id)("pai")("wait", this.game[sit].hide, cmds);
       return;
     } else if (this.game.turn == this.game.last) { // 已轮询一周
       var sit = next(this.game.last); // sit 是 last 的下家
       // 设置废牌落地
       this.game.desk.push(this.game.card);
       this.game.card = "";
       // 发新牌
       var p = this.game.buff.shift();
       if (!p) {
	 // 若牌已发完
	 // **** 失败终局(流局)
	 this.host = next(this.host); // 轮庄
	 this.play = false; // 终局
	 cast(this.list)("pai")("fail"); // 广播流局
	 return; // 没有必要继续叫牌
       } else {
	 // 发牌给sit
	 this.game[sit].hide.push(p);
	 // 此时应该轮到sit出牌
	 this.game.last = sit;
	 this.game.turn = "";
       }
     } else { // 轮询中
       var sit = next(this.game.turn); // sit 是 turn
       var cmds = do_calc(this.game[sit], this.game.card); // 计算可选项
       if (!cmds) {
	 // 若无项可选项
	 // 交给下家
	 this.game.turn = next(sit);
       } else {
	 // 若有项可选
	 // 叫牌人有忍牌选项
	 cmds.push("hold");
	 // 要求sit选择
	 cast(this.sits[sit].id)("pai")("wait", this.game[sit].hide, cmds);
	 return; // 完成叫牌
       }
     }
     // 未完成
     loop(); // 继续叫牌
   }

// ****************************************************************
// * UTILS FUNCTIONS
// ****************************************************************

   function rand(max) {
     return Math.floor(Math.random() * max);
   }

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

   function next(fang){

   }

   function do_bill(sit){

   }

   function is_done(array){

   }

   function is_ting(array){

   }

   function is_gang(array){

   }

   function is_peng(array){

   }

   function is_shun(array){

   }

// ****************************************************************
// * LISTS FUNCTIONS
// ****************************************************************

   function indexof(e, array){
     for (var i=0; i<array.length; i++){
       if (array[i] == e) return i;
     }
     return -1;
   }

   function member(e, array){
     return (indexof(e, array) != -1);
   }

   function any(func, array){
     for (var i=0; i<array.length; i++){
       if (func(array[i])) return true;
     }
     return false;
   }

   function all(func, array){
     for (var i=0; i<array.length; i++){
       if (!func(array[i])) return false;
     }
     return true;
   }

   function first(func, array){
     for (var i=0; i<array.length; i++){
       if (func(array[i])) return array[i];
     }
     return undefined;
   }

   function last(func, array){
     for (var i=array.length - 1; i>0; i--){
       if (func(array[i])) return array[i];
     }
     return undefined;
   }

   function foreach(func, array){
     for (var i=0; i<array.length; i++){
       func(array[i]);
     }
   }

   // ** func(e) return new element
   function map(func, array){
     var r = [];
     for (var i=0; i<array.length; i++){
       r.push(func(array[i]));
     }
     return r;
   }

// ****************************************************************
// * API & STATE
// ****************************************************************

   return {

     // ******** 状态

     // 用户列表
     list:[],          // ** 所有在此房间的用户数据

     // 座位状态
     sits:{            // ** 座位状态
       E:{},              // 东
       S:{},              // 南
       W:{},              // 西
       N:{}               // 北
       // {id:userid, ready:true|false}
     },

     // 游戏中
     play:false,       // ** 游戏中

     // 庄家
     host:"",             // 坐庄

     // 牌局
     game:{
       turn:"",           // 发话人
       last:"",           // 上一手
       card:0,            // 当前牌
       cmds:[],           // 可选项
       // [{cmd, option}, {cmd, option}]
       E:{},              // 东
       S:{},              // 南
       W:{},              // 西
       N:{},              // 北
       // {show:[], hide:[], ting:true|false}
       buff:[],           // 屯牌
       desk:[],           // 废牌
       trim:0             // 牌局杠牌次数
     },

     // ******** 测试

     test:test,           // 测试

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
     pai:pai              // 对牌
     // **** 可用操作
     // done        胡(完成)
     // gang        杠
     // peng        碰
     // shun        吃(顺)
     // kang        忍(扛)
     // drop        打/停

   };

})().test();
