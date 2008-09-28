load("env.js");
// test
(function(){

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

  info("flow :: success "+ pass(tm) +"ms");

})();
