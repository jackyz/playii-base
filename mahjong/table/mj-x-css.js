/*
// fix value, then execute script to generate css file
js -f js-x-css.js > mj-x.css
*/

var l = ["s", "w", "n", "e"];
var wd = {s:11, m:16, l:22};
var hd = {s:15, m:23, l:30};

var sz = "m";
var xd = [wd[sz],  -hd[sz], -wd[sz],  hd[sz]];
var yd = [hd[sz],   wd[sz], -hd[sz], -wd[sz]];
var xs = [0,   wd[sz]*9+hd[sz]*3, wd[sz]*8+hd[sz]*4,  0];
var ys = [0,   0,  wd[sz]*9+hd[sz]*3,  wd[sz]*8+hd[sz]*4];

for(var f=0; f<4; f++){
  var size = sz;
  var direct = l[f];
  var width = Math.abs(xd[f]);
  var height = Math.abs(yd[f]);
  var dx = xd[f];
  var dy = yd[f];
  var sx = xs[f];
  var sy = ys[f];
  print("/* "+direct+" */");
  print(".mj-"+direct+"-t-"+size+" {\n}\n");
  print(".mj-"+direct+"-b0-"+size+" {\n}");
  print(".mj-"+direct+"-b1-"+size+" {\n}");
  print(".mj-"+direct+"-b2-"+size+" {\n}");
  for(var i=0; i<4; i++){
    for(var j=0; j<9; j++){
      var c = i*10+j+1; if(c>37) break;
      var x = f % 2 == 0 ? sx + j * dx : sx + i * dx;
      var y = f % 2 == 0 ? sy + i * dy : sy + j * dy;
      print(".mj-"+direct+"-"+c+"-"+size+" {");
      print("\twidth:"+width+"px; height:"+height+"px;");
      print("\tbackground:url(mj-"+size+".gif) no-repeat -"+x+"px -"+y+"px");
      print("}");
    }
  }
  print("");
}


