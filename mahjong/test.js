load("env.js");

// test
var o = parse();
// inner test
// o.test();

var tm = {};
// outer test
void pass(tm);

o.enter("a", "a_nick", {});
o.enter("b", "b_nick", {});
o.enter("c", "c_nick", {});
o.enter("d", "d_nick", {});

o.sit("a", "sit_down", "E");
o.sit("b", "sit_down", "S");
o.sit("c", "sit_down", "W");
o.sit("d", "sit_down", "N");

o.sit("a", "ready");
o.sit("b", "ready");
o.sit("c", "ready");
o.sit("d", "ready");

o.pai("a", "drop", 37);
o.pai("b", "drop", 34);
o.pai("c", "drop", 37);
o.pai("d", "drop", 36);
o.pai("a", "peng");
o.pai("a", "drop", 35);
o.pai("b", "drop", 8);
o.pai("a", "shun", 7, 9);
o.pai("a", "drop", 34);
o.pai("b", "drop", 24);
o.pai("a", "shun", 22, 23);
o.pai("a", "drop", 33);
o.pai("b", "drop", 32);
o.pai("a", "hold");
o.pai("c", "drop", 33);
o.pai("d", "drop", 35);
o.pai("a", "drop", 16);
o.pai("b", "drop", 35);
o.pai("c", "drop", 31);
o.pai("b", "hold");
o.pai("d", "drop", 32);
o.pai("a", "hold");
o.pai("a", "drop", 8);
o.pai("b", "drop", 19);
o.pai("c", "drop", 18);
o.pai("d", "drop", 19);
o.pai("b", "hold");
o.pai("a", "drop", 29, true);
o.pai("c", "hold");
o.pai("b", "drop", 25);
o.pai("c", "hold");
o.pai("a", "hule");

info("test :: success "+ pass(tm) +"ms");
