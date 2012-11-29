window.addEvent('load', function() {
         
     function setupHighlight(parent, child) {
       var fx = new Fx.Tween(child, {duration:500, wait:false});
       fx.start('opacity', 1.0);
       parent.addEvent('mouseover', function() { 
           fx.start('opacity', 0.3);
         });
       parent.addEvent('mouseout', function() { 
           fx.start('opacity', 1.0);
          });
     }
     
     setupHighlight($('convertbot'), $('weightbot'));
     setupHighlight($('weightbot'), $('convertbot'));
});

window.addEvent('domready', function() {
    $('convertbot').setOpacity(0);
    $('weightbot').setOpacity(0);
});
