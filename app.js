(function($) {

  var scope = {
    pageY: 0,
    height: window.innerHeight,
    sections:[],
    current:0,
    lastY:0,
    down:false,
    count:0
  }

  var targets = {
    0:{
      el:$('.one'),
      tgtX:900,
      tgtY:300,
      offX:300,
      offY:0,
      X:300,Y:0,
      friction:.13
    },
    1:{
      el:$('.two'),
      stagger:true,
      tgtX:50,
      tgtY:0,
      offX:850,
      offY:300,
      X:50,Y:0,
      friction:.05
    },
    2:{
      el:$('.three'),
      tgtX:1250,
      tgtY:0,
      offX:550,
      offY:300,
      X:1200,Y:0,
      friction:.7
    },
    3:{
      el:$('.four'),
      tgtX:800,
      tgtY:0,
      offX:20,
      offY:300,
      X:0,Y:0,
     friction:.17
    }
  }

  function init(){

    var a = $('.box').css({
      'height': scope.height + 'px'
    })
    a.each(function (i,e){
      scope.sections.push(e.offsetTop);
    })
  }

  function getAnchor(){
    return scope.sections[scope.current];
  }
  function testAnchor (){
    
    var val = scope.limit;

    if(scope.pageY > val + scope.height){
      scope.current++;
    } 
    if(scope.pageY < val && scope.pageY > 0){
      scope.current--;  
    }
  } 

  function loop (){

    var tgt = targets[scope.current],
        scroll = scope.height - scope.pageY,
        pct =  1 - (scroll / scope.height) - scope.current; // plays nicely if all sections are the same height

    tgt.diffx = tgt.tgtX - tgt.offX;
    tgt.diffy = tgt.tgtY - tgt.offY;

    
    // is current is not last
    if(scope.current != scope.sections.length-1){

      if(scope.current > 0){

        // all
        // pct += .5;
         
        var tx = (pct * tgt.diffx),
            ty = (pct * tgt.diffy);

      } else {

        // first

        var tx = (pct * tgt.diffx),
            ty = (pct * tgt.diffy);

        // pct += .5; // prep for next only

      }
      
      tgt.X += (tgt.offX + (-tx) - tgt.X ) * tgt.friction;
      tgt.Y += (tgt.offY + (-ty) - tgt.Y ) * tgt.friction;

      tgt.el.css({
        'transform':'translate('+tgt.X+'px,'+Math.sin(scope.count)*150+'px)'
      })

      // next
      
      pct -= 1;

      var nxt = targets[scope.current+1];

      nxt.diffx = nxt.tgtX - nxt.offX;
      nxt.diffy = nxt.tgtY - nxt.offY;
      
      var nx = (pct * nxt.diffx),
          ny = (pct * nxt.diffy);


      nxt.X += (nxt.offX + (-nx) - nxt.X ) * nxt.friction;
      nxt.Y += (nxt.offY + (-ny) - nxt.Y ) * nxt.friction;
      
      nxt.el.css({
        'transform':'translate('+nxt.X+'px,'+Math.sin(scope.count)*150 +'px)'
      })
    
    } else {

      console.log(scope.current,'last')
    }

          

    requestAnimationFrame(function(){
      loop()
    });
  }

  init();

  window.addEventListener('scroll', function (e){
    scope.pageY = window.pageYOffset;
    scope.limit = getAnchor();
    scope.count += .1;

    testAnchor();
  })

  requestAnimationFrame(function(){
    loop()
  });

})(jQuery);

