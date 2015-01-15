var Paxman = function(){

  var query = Array.prototype.slice.call(document.querySelectorAll("section"));

  this.scope = {
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
  console.log(this.scope.sections);
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
}



px.api = function(){

}

String.prototype.contains = function(test) {
  return this.indexOf(test) == -1 ? false : true;
};