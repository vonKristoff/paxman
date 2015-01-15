var Paxman = function(){

  var query = Array.prototype.slice.call(document.querySelectorAll("section"));

  this.scope = {
    scroll:{},
    sections:{},
    current:0
  }

  this.parallax = this.behaviours();

  this.init(query);

  return this.api()
}
var px = Paxman.prototype;

px.init = function(query){

  // build the model
  this.establishModel(query);

  this.addScrollEvents();
  
  // start render engine
  // requestAnimationFrame(function(){
  //   this.enterFrame()
  // });
}

px.establishModel = function(q){

  function getChildren(el){

    var children = [],
        nodelist = el.querySelectorAll('.px-child'),
        collection = Array.prototype.slice.call(nodelist);

    if(collection.length > 0){

      collection.forEach(function (el,index){
        
        var child = {
          index:index,
          el:el,
          offset:{
            start:null,
            end:null,
            name:null,
            fn:null
          },
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
      })
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

    var bg = el.dataset.bg,
        offy = (el.dataset.offy != undefined)? parseFloat(el.dataset.offy) : 0.5;

    this.css(el,{
      'background-image':'url('+bg+')',
      'background-size':'100% auto',
      'background-position':'0 '+(offy*100)+'%'
    })

  }

  q.forEach(function (el,index){
  
    el.setAttribute('data-id',index);

    this.scope.sections[index] = {
      el:       el,
      visible:  false,
      pct:      0,
      scroll:   (el.dataset.scroll != 'top')? 'bottom' : 'top',
      offy:     (el.dataset.offy != undefined)? parseFloat(el.dataset.offy) : 0.5,
      speed:    (el.dataset.speed != undefined)? el.dataset.speed : 0.5,
      height:   checkHeightConfig.call(this, el),
      width:    el.clientWidth,
      top:      el.offsetTop,
      max:      el.clientHeight + el.offsetTop,
      children: getChildren(el)
    }
    if(el.dataset.bg != undefined) configBG.call(this, el);

  }.bind(this))


  this.scope.total = Object.keys(this.scope.sections).length;
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

px.render = function(i){
  var item = this.scope.sections[i];
  this.parallax.backgrounds(item);
  this.parallax.children(item.children,item);
}

px.evaluate = function(i){
  var item = this.scope.sections[i],
      s = this.scope.scroll;
  // set percentage of visible scroll for item
  item.pct = (s.scroll_top - item.top) / item.height;

  // eval whether to render section or not
  this.visibility(i);

  // console.log(item.pct);
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

      // for now
      this.render(i)
    }
  }.bind(this))

  window.addEventListener('resize', function (e){

    // check any auto sizes and amend them to scope

  }.bind(this))
}

px.behaviours = function(){

  var fn = {
    backgrounds:function(item){

      var val = item.offy * 100;

      if(item.scroll != 'top'){
        // scroll down
        val -= (item.pct * item.speed) * 100
      } else {
        // going down
        val += (item.pct * item.speed) * 100
      }

      this.css(item.el,{
        'background-position':'0% '+val+'%'
      })
    }.bind(this),
    children:function(group, parent){
      if(group.length > 0){ 
        for(var i=0;i<group.length;i++){
          var child = group[i];


          this.parallax.feed(this.parallax.whoami(child));


          //     value = this.compileOffsetData(child, parent); // thinking now about multiple offsets!

          // var n = child.offset.name;

          // console.log(value);

          // this.css(child.el,{
          //   'transform' : 'translate('+value+')'
          // })
        }
      }
    }.bind(this),
    feed:function(val){
      console.log('feeding ',val,' to render loop');
    }
  }
  return fn
}

px.compileOffsetData = function(child, parent){

  var test_start = child.offset.start,
      test_end = child.offset.end;

  var start = test_start.split(','),
      end = test_end.split(',');

  function getValTypes(obj){
    if(obj.contains('px')){
      var num = obj.replace('px','');
      return {int:num,data:'px'}
    } else{
      if(obj.contains('%')){
        var num = obj.replace('%','');
        return {int:num,data:'%'}
      } else {
        return {int:obj}
      }  
    }
  }

  
    var startVal = [];
    start.forEach(function (val,i){
      startVal[i] = getValTypes(val)
    })
    var endVal = [];
    end.forEach(function (val,i){
      endVal[i] = getValTypes(val)
    })

    var results = [];

    for(var j=0;j<startVal.length;j++){

      var diff = endVal[j].int - startVal[j].int,
          position = diff * (parent.pct)

      results[j] = position + endVal[j].data;

    }

    if(results.length > 0){
      var string = results.join()
      return string
    } else {
      return results[0]
    }

    // rule
    // diff = end - start;
    // currentpos = diff * parent.pct // (pct +1 if start-scroll=bottom)
  

}

px.enterFrame = function(){

  this.render()

  requestAnimationFrame(function(){
    this.enterFrame()
  });
}



String.prototype.contains = function(test) {
  return this.indexOf(test) == -1 ? false : true;
};