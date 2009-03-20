function _populateTree(json) {
  var treechildren = document.getElementById('treechildren');

  // clear out any old children
  while (treechildren.hasChildNodes()) {
    treechildren.removeChild(treechildren.lastChild);
  }

  // add all of the new children
  var tree = document.getElementById('tree');
  var box = tree.treeBoxObject;
  box.beginUpdateBatch();
  generateDom(json, "*root*", treechildren);
  box.endUpdateBatch();

  // expand the first node, if available
  if (treechildren.firstChild) treechildren.firstChild.setAttribute('open', 'true');
}

function generateDom(json, name, parent) {

  var treeitem = document.createElement('treeitem');
  var treerow = document.createElement('treerow');

  var property = document.createElement('treecell');
  property.setAttribute("label", name);
  treerow.appendChild(property);

  var value = document.createElement('treecell');
  value.setAttribute("label", json.toString());
  treerow.appendChild(value);
  treeitem.appendChild(treerow);

  if (typeof json == 'object') {    
    treeitem.setAttribute("container", "true");
    var treechildren = document.createElement('treechildren');
    for (var j in json) {
      generateDom(json[j], j, treechildren);
    }

    treeitem.appendChild(treechildren);
  }

  parent.appendChild(treeitem);
}


