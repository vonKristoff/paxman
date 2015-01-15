String.prototype.contains = function(test) {
  return this.indexOf(test) == -1 ? false : true;
};

(function($) {



// DOM elements
/*
  engine   - render all simultaneously, but draw only 2 instances

  section  - make up of the total scrolling content
           - create id's based on nth-of-type
           - configure heights for scope
           - bg urls for parallax scrolling

  contents - scroll start behaviour, top/bottom
           - offsets, data-offset-opacity, data-offset-x
           - function name
           - id
           - px-child classname signifier


window.onscroll = function(){
    
    console.log(
        'scroll', window.pageYOffset,
        'visible height',window.innerHeight,
        'page height',document.documentElement.scrollHeight,
        'total',window.pageYOffset + window.innerHeight,
        'focus',(window.pageYOffset + window.innerHeight) - window.innerHeight/2
    );
    
}  

*/

var selection = Array.prototype.slice.call(document.querySelectorAll("section")),
    sections = {},
    scope = {
      current:0,
      total:0,
      max:0
    }

window.onscroll = function(){

  for(var i=0;i<Object.keys(sections).length;i++){  

    var ank = sections[i];

    // console.log(
    //   i,
    //   'scroll-top', window.pageYOffset,
    //   'visible height',window.innerHeight,
    //   // // 'page height',document.documentElement.scrollHeight,
    //   'scroll-bottom',window.pageYOffset + window.innerHeight,
    //   // 'centerY',(window.pageYOffset + window.innerHeight) - window.innerHeight/2,
    //   'currentAnchor',currentAnchor(),
    //   'current percentage', (window.pageYOffset - ank.top) / ank.height
  
    // );
    visibility(i);
    
    if(ank.children.length > 0){
      var pct = (window.pageYOffset - ank.top) / ank.height;
      var val = ank.children[0].tgt.opacity - ank.children[0].offset.opacity;
      var act = pct * val;
      console.log(act);
      $(ank.children[0].el).css('opacity',act)
    }
  }

  scope.current = currentAnchor();
  
}

function visibility(i){

  var scroll_bottom = window.pageYOffset + window.innerHeight,
      scroll_top = window.pageYOffset,
      bottomThreshold =  scroll_bottom - sections[i].top;

  function cloak(who, bool){
    if(bool){
      if(who.visible) {
        who.$el.css('visibility','hidden')
        who.visible = false;
      }       
    } else {
      if(!who.visible){
        who.$el.css('visibility','visible')
        who.visible = true;
      }
    }
  }

  // does the threshold pass the bottom of the visible area
  if(bottomThreshold > 0){
    // now check if it has passed the top of the visible area
    var topThreshold = bottomThreshold - window.innerHeight
    if(topThreshold > sections[i].height){
      // you aint visible
      cloak(sections[i],true)
    } else {
      // you are visible
      cloak(sections[i],false)
    }
  } else {
    cloak(sections[i],true)
  }
}

function currentAnchor(){
  var scroll = window.pageYOffset;
  for(var i=0;i<Object.keys(sections).length;i++){
    if(scroll > 0){
      if(scroll > sections[i].max){
        // try next
      } else if(scroll > sections[i].top){
        return i;
      }
    } else {
      return 0
    }
  }
}

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

selection.forEach(function (el,index){
  
  el.setAttribute('data-id',index);

  sections[index] = {
    $el: $(el),
    visible:false,
    bg:el.dataset.bg,
    height:el.clientHeight,
    top:el.offsetTop,
    max: el.clientHeight + el.offsetTop,
    children: getChildren(el)
  }
})

console.log();



})(jQuery);