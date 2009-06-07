// playii js

// **** the list object
if (!this.LIST) LIST = function(){

  // ** func(e) return true | false
  function all(func, array){
    for (var i=0; i<array.length; i++){
      if (!func(array[i])) return false;
    }
    return true;
  }

  // ** func(e) return true | false
  function any(func, array){
    for (var i=0; i<array.length; i++){
      if (func(array[i])) return true;
    }
    return false;
  }

  function clone(array){
    var r = [];
    for (var i=0; i<array.length; i++){
      r.push(array[i]);
    }
    return r;
  }

  function count(e, array){
    var c = 0;
    for (var i=0; i<array.length; i++){
      if (e == array[i]) c++;
    }
    return c;
  }

  // ** func(e) return true | false
  function first(func, array){
    for (var i=0; i<array.length; i++){
      if (func(array[i])) return array[i];
    }
    return undefined;
  }

  // ** func(e) return void
  function foreach(func, array){
    if(!array) return;
    for (var i=0; i<array.length; i++){
      func(array[i]);
    }
  }

  function indexof(e, array){
    for (var i=0; i<array.length; i++){
      if (array[i] == e) return i;
    }
    return -1;
  }

  // ** func(e) return true | false
  function last(func, array){
    for (var i=array.length - 1; i>0; i--){
      if (func(array[i])) return array[i];
    }
    return undefined;
  }

  // ** func(e) return new element
  function map(func, array){
    var r = [];
    for (var i=0; i<array.length; i++){
      r.push(func(array[i]));
    }
    return r;
  }

  function member(e, array){
    for (var i=0; i<array.length; i++){
      if (array[i] == e) return true;
    }
    return false;
  }

  function remove(e, array){
    var r = [], m = false;
    for (var i=0; i<array.length; i++){
      if (!m && array[i] == e) m = true;
      else r.push(array[i]);
    }
    return r;
  }

  return {
    count:count, member:member, indexof:indexof, remove:remove,
    clone:clone, map:map, foreach:foreach,
    all:all, any:any, first:first, last:last
  };

}();

// **** the dict object (hash object)
if (!this.DICT) DICT = function(){

  function foreach(func, dict){
    for(var i in dict){
      func(dict[i]);
    }
  }

  return {
    foreach:foreach
  };

}();


