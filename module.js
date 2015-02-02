var Paxman = function(){

  var query = Array.prototype.slice.call(document.querySelectorAll("section"));

  this.scope = {
    screen:{},
    scroll:{count:0},
    sections:{},
    current:0
  }

  this.vectors = {};

  this.parallax = this.behaviours();

  this.init(query);

  return this.api()
}
var px = Paxman.prototype;

px.init = function(query){

  // set dimensions
  this.captureScreenRatio();

  // build the model
  this.establishModel(query);

  this.addScrollEvents();
  
  // start render engine
  requestAnimationFrame(function(){
    this.enterFrame()
  }.bind(this));
}

px.establishModel = function(q){

  function getChildren(el, pi){

    var children = [],
        nodelist = el.querySelectorAll('.px-child'),
        collection = Array.prototype.slice.call(nodelist);

    if(collection.length > 0){

      collection.forEach(function (el,index){

        this.vectors[pi].children[index] = {x:0,y:0,opacity:0};
    
        var child = {
          index:index,
          el:el,
          offset:{
            start:null,
            end:null,
            name:null,
            fn:null
          },
          seed: Math.random(),
          style:{},
          scroll:(el.dataset.scroll != 'top')? 'bottom' : 'top'
        }
        // build offset object
        for (key in el.dataset){
          var property = key;
          if(property.contains('offset')){
            var name = property.replace('offset','').toLowerCase();
            child.offset[name] = el.dataset[key];
          }
        }
        children.push(child)
      }.bind(this))
    }
    return children
  }

  function checkHeightConfig (el){
    switch(el.dataset.height){
      case 'full-screen':
        var h = window.innerHeight;
        this.css(el,{
          'height':h+'px'
        })
        return h
      break;
      case 'half-screen':
        var h = window.innerHeight/2;
        this.css(el,{
          'height':h+'px'
        })
        return h
      break;
      default:
        return el.clientHeight
      break;
    }
  }

  function configBG(el){

    var bg = el.dataset.bg.split(',')[0],
        offy = (el.dataset.offy != undefined)? parseFloat(el.dataset.offy) : 0.5;

    this.css(el,{
      'background-image':'url('+bg+')',
      'background-size':'100% auto',
      'transform':'translateZ(0)',
      'background-position':'0 '+(offy*100)+'%'
    })

  }

  q.forEach(function (el,index){
  
    el.setAttribute('data-id',index);

    this.vectors[index] = { children:{} };

    this.scope.sections[index] = {
      id:       index,
      el:       el,
      bg:       el.dataset.bg,
      visible:  false,
      pct:      0,
      scroll:   (el.dataset.scroll != undefined)? el.dataset.scroll : 'bottom',
      horizontal:el.dataset.horizontal, 
      offy:     (el.dataset.offy != undefined)? parseFloat(el.dataset.offy) : 0.5,
      speed:    (el.dataset.speed != undefined)? el.dataset.speed : 0.5,
      height:   checkHeightConfig.call(this, el),
      width:    el.clientWidth,
      top:      el.offsetTop, // y top
      max:      el.clientHeight + el.offsetTop, // y bottom
      children: getChildren.call(this,el,index),
      masking:  (el.dataset.mask != undefined)? this.buildMaskObject(el, el.dataset.mask, el.dataset.bg, index) : false // is there a mask attached
    }

    // set speed ratio to stop scroll differences on devices -- unsure
    // this.scope.sections[index].speed *= this.scope.screen.r;

    if(el.dataset.bg != undefined) configBG.call(this, el);

  }.bind(this))

  this.scope.total = Object.keys(this.scope.sections).length;
}

px.buildMaskObject = function(parent, mask, paths, index){

  var $this = this;

  var obj = {
    loaded:false,
    bgs: null,//createContext('canvas-bg'),    // canvas bg image
    ctx: setMask.call(this, mask, index),     // main canvas,
    mask: null,
    images:null,
    current:0,
    vectors:{bg:{},mask:{}},
    padding: 1.2,
    setBackground:function(root){
      var tgt = this.images[this.current]
      ,   scalex = root.scope.screen.w / tgt.img.width
      ,   width = tgt.img.width * scalex
      ,   height = width / tgt.ratio
      ,   stx = 0
      ,   sty = -height/2;
      // possible set vectors here

      this.vectors.bg = {
        x: 0,
        y: sty,
        w: width,
        h: height
      }
    },
    setMasking:function(root){

      this.vectors.mask = {
        // width: (root.scope.screen.w/this.mask.width) * this.padding,
        sy: root.scope.screen.h/2,
        sx: root.scope.screen.w/2,
        tgt:0,
        tx:0,
        ty:0
      }
    }
  }
  function createContext(id){

    canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = $this.scope.screen.w;
    canvas.height = $this.scope.screen.h;
    canvas.style.position = 'absolute';

    parent.appendChild(canvas);
    
    return canvas.getContext("2d"); 
  }
  function setMask(src, index){

    var img = new Image();
    img.src = src;
    img.onload = function(){
      var i = index;
      this.scope.sections[i].masking.mask = img;
    }.bind(this);

    return createContext('canvas-mask');
  }

  // setup the images to be used in the set
  this.parseImages(paths, function (objs){    
    
    var i = index
    ,   maskObject = this.scope.sections[i].masking;

    maskObject.images = objs; // returns the loaded and preped images array
    // set dimension vectors now loaded for current image
    maskObject.setBackground(this);
      
    maskObject.setMasking(this);
    
    maskObject.loaded = true;

  }.bind(this))

  return obj
}
px.parseImages = function (data, cb){

  var tmp = [], sorted = [], paths = data.split(',');

  function loadImage (src, i, $this){

    var img = new Image();
    img.src = src;
    img.onload = loaded;
    
    function loaded() {     
  
      tmp.push({ img:img, index:i, ratio: img.width/img.height }); // ratio assumes they are landscape
      // if end of load sort the array to how it was intented
      if(tmp.length === paths.length){
        for(l=0;l<tmp.length;l++){
          sorted[tmp[l].index] = tmp[l];
        }
        cb(sorted);
      }
    }
  }
  paths.forEach(function (file, i){
    loadImage(file, i, this);
  },this)
}

px.visibility = function(j){

  var s = this.scope.scroll,
      item = this.scope.sections[j];

  var bottomThreshold =  s.scroll_bottom - item.top;

  function cloak(bool){
    if(bool){
      if(item.visible) {
        this.css(item.el,{'visibility':'hidden'})
        item.visible = false;
      }       
    } else {
      if(!item.visible){
        this.css(item.el,{'visibility':'visible'})
        item.visible = true;
      }
    }
  }

  // does the threshold pass the bottom of the visible area
  if(bottomThreshold > 0){
    // now check if it has passed the top of the visible area
    var topThreshold = bottomThreshold - s.view_height;
    if(topThreshold > item.height){
      // you aint visible
      cloak.call(this,true)
    } else {
      // you are visible
      cloak.call(this,false)
    }
  } else {
    cloak.call(this,true)
  }
}


px.currentAnchor = function(){
  // tests the scroll positions of elements and returns the element of main focus
  var s = this.scope,
      scroll = s.scroll.scroll_top;
  for(var i=0;i<s.total;i++){
    if(scroll > 0){
      if(scroll > s.sections[i].max){
        // try next
      } else if(scroll > s.sections[i].top){
        return i;
      }
    } else {
      return 0
    }
  }
}
// use method to add css properties to element 
px.css = function(target, properties) {
  for(var key in properties) {
    target.style[key] = properties[key];
  }
}
// use to extend lib in main script
px.api = function(){

  return {
    extend:function(name,fn){

      this[name] = fn;

    }.bind(this.parallax)
  }
}

px.update = function(i){
  var item = this.scope.sections[i];
  if(item.visible){
    this.parallax.backgrounds(item);
    if(item.children.length > 0) this.parallax.children(item.children,item);
    if(item.masking.loaded) this.parallax.masking(item)
  }
}

px.evaluate = function(i){
  var item = this.scope.sections[i],
      s = this.scope.scroll;
  
  var pct = (s.scroll_top - item.top) / item.height;
  
  item.pct = this.offset(item.scroll, pct)

  // eval whether to render section or not
  this.visibility(i);
  // update vectors
  this.update(i);
}
// helper for when scroll percentage should be active based on anchor
px.offset = function (direction, pct){

  switch (direction){
    case 'top': // 0% at top of page
      val = 1 + (pct);
    break;
    case 'mid': // 50% at top of page
      val = .5 + (pct);
      console.log(val,'mid');
    break;
    case 'left':
      val = -1;
    break;
    case 'right':
      val = 0;
    break;
    default: // 100% at top of page
      val = pct;
    break;
  }
  return val
}
px.addScrollEvents = function(){
  
  window.addEventListener('scroll', function (e){
    
    var w = window,
        s = this.scope.scroll;
    
    s.scroll_top     = w.pageYOffset; // default scroll position
    s.view_height    = w.innerHeight; // browser height
    s.scroll_bottom  = s.scroll_top + s.view_height; // scroll pos at bottom of view

    this.scope.current = this.currentAnchor();

    for(var i=0;i<this.scope.total;i++){
      this.evaluate(i); // evaluate calculations on section
    }

    s.count += .1;

  }.bind(this)) 
}

// scrolling behaviours
px.behaviours = function(){

  var fn = {

    masking: function(item){

      var mask = item.masking.vectors.mask;

      if(item.pct > 0){
        // calculate mask targets        
        mask.tgt = (this.scope.screen.w * item.pct) * 1.2;
      } else {
        mask.tgt = 0;
      }
    }.bind(this),
    backgrounds:function(item){
      var val = 0;
      // set the scroll percentage offset
      val = item.pct * 100;
      item.style = { 'background-position' : val };
    }.bind(this),
    children:function(group, parent){

      if(group.length > 0){ 

        var styles = [];

        for(var i=0;i<group.length;i++){

          var child = group[i],
              custom = child.offset.fn;
              
          if(parent.visible && typeof custom == 'string') {
             child.style = this.parallax[custom](child, parent, this.scope.scroll.count);          
          }
        }
      }
    }.bind(this)
  }
  return fn
}
px.captureScreenRatio = function (e){

  this.scope.screen = {
    w: window.innerWidth,
    h: window.innerHeight
  }

  // set ratio based on orientation

  if(this.scope.screen.w > this.scope.screen.h){
    this.scope.screen.mode = 'LANDSCAPE';
    this.scope.screen.r = this.scope.screen.w / this.scope.screen.h;
  } else {
    this.scope.screen.mode = 'PORTRAIT';
    this.scope.screen.r = this.scope.screen.h / this.scope.screen.w;
  }
  
}

px.render = function(){
  
  // by this point scroll has already update the style targets

  for(var i=0;i<this.scope.total;i++){
    var item = this.scope.sections[i];
    if(item.visible){
      //background first
      if(item.bg != undefined){
        // apply css tgt
        var tgt = item.style['background-position'];

        if(item.horizontal != undefined){
          this.css(item.el,{
            'background-position': tgt+'px 0' // why 10!? managable pixle figure ..
          })
        } else {
          this.css(item.el,{
            'background-position': '0 '+tgt+'%'
          })
        }
      }
      if(item.children.length > 0){
        item.children.forEach(function (child,index){
          // apply css to child
          var vector = this.vectors[i].children[index],
              style = child.style;

          vector.x += (style.x - vector.x)*style.friction
          vector.y += (style.y - vector.y)*style.friction
          vector.opacity += (style.opacity - vector.opacity)*.97

          this.css(child.el,{
            'position': 'absolute',
            'transform': 'translate('+vector.x+'px,'+vector.y+'px)',
            'opacity':vector.opacity,
            'background-position':style['background-position']
          })

        }.bind(this))
      }
      // masking item render
      if(item.masking.loaded){
        this.renderMasks(item.masking, item.pct);
      }
    }
  }
}
px.renderMasks = function(tgt, pct){

  var ctx = tgt.ctx,
      bg = tgt.vectors.bg,
      mask = tgt.vectors.mask;

  mask.tx += ((-mask.tgt/2) - mask.tx) * .97;
  mask.ty += ((-mask.tgt/2) - mask.ty) * .97;

  ctx.clearRect(0,0,bg.w,bg.h)

  ctx.globalCompositeOperation = 'source-over'; 

  ctx.drawImage(tgt.images[tgt.current].img, 0, bg.y , bg.w, bg.h); 

  ctx.globalCompositeOperation = 'destination-out';

  ctx.save(); ctx.translate(mask.sx, mask.sy); ctx.rotate(pct * 2);
  
  ctx.drawImage(tgt.mask, mask.tx, mask.ty, mask.tgt, mask.tgt)

  // draw your object
  ctx.restore();
}
px.enterFrame = function(){

  this.render()

  requestAnimationFrame(function(){
    this.enterFrame()
  }.bind(this));
}

String.prototype.contains = function(test) {
  return this.indexOf(test) == -1 ? false : true;
};