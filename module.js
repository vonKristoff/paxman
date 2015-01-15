var Paxman = function(){

  var query = Array.prototype.slice.call(document.querySelectorAll("section"));

  this.scope = {
    scroll:{},
    sections:{},
    current:0
  }

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
          offset:{},
          tgt:{}
        }
        // build offset object
        for (key in el.dataset){
          var str = key,
              style = window.getComputedStyle(el)
              
          if(str.contains('offset_')){
            var param = str.replace('offset_',''),
                cssvalue = style.getPropertyValue(param);
            // set offsets and targets 
            child.tgt[param] = cssvalue;        
            child.offset[param] = el.dataset[key];
          }
        }

        children.push(child)
      })
    }
    return children
  }

  q.forEach(function (el,index){
  
    el.setAttribute('data-id',index);

    this.scope.sections[index] = {
      el:       el,
      visible:  false,
      bg:       el.dataset.bg,
      height:   el.clientHeight,
      top:      el.offsetTop,
      max:      el.clientHeight + el.offsetTop,
      children: getChildren(el)
    }
  }.bind(this))

  this.scope.total = Object.keys(this.scope.sections).length;
}

px.visibility = function(j){

  var scroll_bottom = window.pageYOffset + window.innerHeight,
      scroll_top = window.pageYOffset,
      bottomThreshold =  scroll_bottom - sections[j].top;

  function cloak(who, bool){
    if(bool){
      if(who.visible) {
        this.css(el,{'visibility':'hidden'})
        who.visible = false;
      }       
    } else {
      if(!who.visible){
        this.css(el,{'visibility':'visible'})
        who.visible = true;
      }
    }
  }

  // does the threshold pass the bottom of the visible area
  if(bottomThreshold > 0){
    // now check if it has passed the top of the visible area
    var topThreshold = bottomThreshold - window.innerHeight
    if(topThreshold > sections[j].height){
      // you aint visible
      cloak(sections[j],true)
    } else {
      // you are visible
      cloak(sections[j],false)
    }
  } else {
    cloak(sections[j],true)
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
    target.style[ key ] = properties[ key ];
  }
}
// use to extend lib in main script
px.api = function(){

}

px.render = function(){

}

px.evaluate = function(i){

}

px.addScrollEvents = function(){
  
  window.addEventListener('scroll', function (e){
    
    var w = window,
        s = this.scope.scroll;
    
    s.scroll_top     = w.pageYOffset; // default scroll position
    s.view_height    = w.innerHeight; // browser height
    s.scroll_bottom  = s.scroll_top + s.view_height; // scroll pos at bottom of view

    for(var i=0;i<this.scope.total;i++){
      this.evaluate(i);
    }

    this.scope.current = this.currentAnchor();

  }.bind(this))
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