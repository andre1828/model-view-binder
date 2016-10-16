let customTypes =(function() {
  'use strict';
  let doc = document;

  class MVB_Type {

      findBoundNodes(variableName) {
          this.boundNodes = doc.querySelectorAll(`[inner*="${variableName}"],
                                                        [bind-value*="${variableName}"]`);

          this.setValue();

      }

      setValue() {}
  }

  class number extends MVB_Type {

      constructor(number, name) {
          super()

          // if given value is not a number
          // show error and leave
          if (typeof number !== 'number') {
              console.error('Error on object creation, must initialize with a number');
              return;
          }
          // set internal value
          this.number = number;
          // set name of variable ( temporary solution)
          this.name = name;

          this.findBoundNodes(this.name);
      }

      get() {
          return this.number;
      }

      set(newValue) {
          if (typeof newValue !== 'number') {
              console.error('Error on set(), Invalid value type, must be a number');
              return;
          }
          this.number = newValue;

          this.setValue();

      }

      // apply value to all binded nodes
      setValue() {
          for (var node of this.boundNodes) {

              if (node.tagName === 'INPUT')

                  switch (node.getAttribute('type')) {
                  case 'text':
                      node.value = this.number;
                      break;
                  case 'checkbox':
                      console.error('This input is not compatible with number type');
                      break;
                  case 'radio':
                      console.error('This input is not compatible with number type');
                      break;

              }
              else if (node.tagName === 'SELECT')
                  node.value = this.number;
              else
                  node.innerHTML = this.number;
          }

      }
  }

  class string extends MVB_Type {
      constructor(string, name) {
          super();

          this.string = string;
          this.name = name;

          this.findBoundNodes(this.name)
      }

      get() {
          return this.string;
      }

      set(newValue) {
          if (typeof newValue !== 'string') {
              console.error('Error on set(), Invalid value type, must be a string');
              return;
          }
          this.string = newValue;

          this.setValue();
      }

      setValue() {
          for (var node of this.boundNodes) {

              if (node.tagName === 'INPUT')

                  switch (node.getAttribute('type')) {
                  case 'text':
                      node.value = this.string;
                      break;
                  case 'checkbox':
                      console.error('This input is not compatible with string type');
                      break;
                  case 'radio':
                      console.error('This input is not compatible with string type');
                      break;
              }

              else if (node.tagName === 'SELECT')
                  node.value = this.string;
              else
                  node.innerHTML = this.string;
          }
      }

  }

  class boolean extends MVB_Type {
      constructor(boolean, name) {
          super();

          if (typeof boolean !== 'boolean') {
              console.error('Error on objet creation, must initialize with a boolean');
              return;
          }
          this.boolean = boolean;
          this.name = name;

          this.findBoundNodes(this.name);
      }

      get() {
          return this.boolean;
      }

      set(newValue) {
          if (typeof newValue !== 'boolean') {
              console.error('Erro on set(), Invalid value type, must be a boolean');
              return;
          }
          this.boolean = newValue;

          this.setValue();
      }

      setValue() {
          for (var node of this.boundNodes) {
              if (node.tagName === 'INPUT')

                  switch (node.getAttribute('type')) {
                  case 'text':
                      node.value = this.boolean;
                      break;
                  case 'checkbox':
                      node.checked = this.boolean;
                      break;
                  case 'radio':
                      node.checked = this.boolean;
                      break;

              }

              else if (node.tagName === 'SELECT')
                  node.value = this.boolean;
              else
                  node.innerHTML = this.boolean;
          }
      }

  }

  class object extends MVB_Type {
    constructor(object, bindName) {
        super();
        if (typeof object !== 'object') {
            console.error('Error on objet creation, Must initialize with an object');
            return;
        }

        this.object = object;
        this.bindName = bindName;

        // clone all attributes from provided object
        for (var variableName in this.object)
            this[variableName] = this.object[variableName];

        // create setters for all properties
        for (var property in this.object)
            this[`set_${property}`] = setterMaker(this, property);

        this.findBoundNodes(bindName);

    }
    setValue() {
    let boundNodesList = this.boundNodes;

    for (var node of boundNodesList) {
        // if node contains bind-value directive
        if (node.getAttribute('bind-value')) {
            // get directive value
            let nodeAttribute = node.getAttribute('bind-value');
            // extract part of the value to know which attribute of obj the node is bound
            // ex: person.name =>  name
            let partialAttrValue = nodeAttribute.substring( nodeAttribute.indexOf('.') + 1);
            // set the value on node
            node.setAttribute('value', this[partialAttrValue]);
        }

        if(node.getAttribute('inner')) {
            // get directive value
            let nodeAttribute = node.getAttribute('inner');
            // extract part of the value to know which attribute of obj the node is bound
            // ex: person.name =>  name
            let partialAttrValue = nodeAttribute.substring( nodeAttribute.indexOf('.') + 1);
            //set the innerHTML on node
            node.innerHTML = this[partialAttrValue];
        }

    }
}
}

  // takes an obj and a property of this obj
  // and creates a get function for this property in the obj
  function setterMaker(obj, property) {

      let external_propertyType = typeof property;

      let set = function(newValue) {

              let propertyType = typeof obj[property];

              if (typeof newValue !== propertyType) {
                  console.error('Error on object creation, must initialize with an ' + propertyType);
                  return;
              }
              this[property] = newValue;
              // update view calling setValue
              this.setValue();
          }
          // if obj[property] is also an object
          // we call setterMaker recursively

      // bind function to obj
      // so that 'this' refers
      // to the obj receiving the function
      set = set.bind(obj);

      return set;
  }

  class array extends MVB_Type {

    constructor(array, name) {
        super();

        this.array = array;
        this.name = name;
        this.findBoundNodes(this.name);
        this.referenceNodes = this.boundNodes;
        this.parentNodes = Array.from(this.boundNodes).map(boundnode => boundnode.parentNode);
        this.setValue();
    }

    get(index) {
        // if no index is provided, return internal array
        if (!index) return this.array;

        if (isNaN(index)) {
            console.error('Invalid argument, argument must be a number');
            return;
        }
        // if invalid index is provided, show error and abort
        if (this.array[index] === undefined) {
            console.error('attempt to access unexistant index in array');
            return;
        }

        return this.array[index];
    }

    set(index, item) {
        if (isNaN(index)) {
            console.error('Invalid argument, argument must be a number');
            return;
        }
        if (index > (this.array.length - 1) || index < 0)
            console.error('attempt to insert item in invalid position of array');
        else
            this.array[index] = item;

            for (var i = 0; i < this.boundNodes.length; i++) {
              let nodeToUpdate = this.parentNodes[i].children.item(index);

              let modifiedNode = modifyNode(this.referenceNodes[i], this.array[index]);
              // remove custom attributes
              modifiedNode = cleanCustomAttributes(modifiedNode);
              // add new node
              this.parentNodes[i].insertBefore(modifiedNode, nodeToUpdate);
              // remove old node from view
              this.parentNodes[i].removeChild(nodeToUpdate);
            }
    }

    add(item) {
        // adds item to array
        this.array.push(item);

        // iterates through all bound nodes to update view
        for (var i = 0; i < this.boundNodes.length; i++) {
          //gets node that contains the list of repeated nodes
          let parentNode = this.parentNodes[i];
          // generate a clone node based on existant nodes of the list
          // filled with information of added item
          let nodeClone = generateCloneForIndex(this.boundNodes[i], this.array, this.array.length-1);
          // adds node to list
          parentNode.appendChild(nodeClone);
        }
    }

    remove(index) {
        if (isNaN(index)) {
            console.error('Invalid argument, argument must be a number');
            return;
        }

        if (this.array[index] === undefined) {
            console.error('attempt to remove item from unexistant index in array');
            return;
        }
        // remove item of given index
        this.array.splice(index, 1);


        // on all bound nodes
        for (var i = 0; i < this.boundNodes.length; i++) {
            // get the parent node
            let parentNode = this.parentNodes[i];

            // remove node that corresponds to given index
            parentNode.removeChild(parentNode.children.item(index));
        }

    }

    findBoundNodes() {
        this.boundNodes = doc.querySelectorAll(`[repeat*="${this.name}"]`);
    }

    setValue() {
    for (var i = 0; i < this.boundNodes.length; i++) {
        let parentNode = this.boundNodes[i].parentNode;

        // remove reference element
        parentNode.removeChild(this.boundNodes[i]);

        let node = this.boundNodes[i];

        // modify first node
        let modifiedNode = modifyNode(node, this.array[0]);

        // node is modified, now just clone
        let fragContainer = generateClones(modifiedNode, this.array);

        parentNode.appendChild(fragContainer);
    }
}

}
// takes node, reads all its directives (inner, bind-value, etc)
// and apply changes accordingly
// isChild paramerer is optional and used to allow recursion
// so that child nodes can be modified using this same method
function modifyNode(node, itemInArray, isChild = false) {
    let repeatValue = node.getAttribute('repeat');

    // if its an indexed binding (ex: repeat="p in array")
    if (!isChild && repeatValue.includes('in')) {
        if (node.getAttribute('bind-value') !== null) {
            let bindValueAttr = node.getAttribute('bind-value');
            let partialAttr = bindValueAttr.substring(bindValueAttr.indexOf('.') + 1);
            node.setAttribute('value', itemInArray[partialAttr]);
        }

        if (node.getAttribute('inner') !== null) {
            let innerAttr = node.getAttribute('inner');
            let partialInnerAttr = innerAttr.substring(innerAttr.indexOf('.') + 1);
            node.innerHTML = itemInArray[partialInnerAttr];
        }
        // check if node has children and call modifyNode on each child if it has
        if (node.children.length) {
            for (var child of node.children) {
                modifyNode(child, itemInArray, true);
            }
        }


    } else {
        if (node.getAttribute('bind-value') !== null) {
            let bindValueAttr = node.getAttribute('bind-value');

            if (bindValueAttr.includes('.')) {

                let partialAttr = bindValueAttr.substring(bindValueAttr.indexof('.') + 1);
                node.setAttribute('value', itemInArray[partialAttr]);
            } else {

                node.setAttribute('value', itemInArray);
            }
        }

        if (node.getAttribute('inner') !== null) {
            let innerAttr = node.getAttribute('inner');

            if(innerAttr.includes('.')) {
                let partialInnerAttr = innerAttr.substring(innerAttr.indexOf('.') + 1);
                node.innerHTML = itemInArray[partialInnerAttr];
            } else {
                node.innerHTML = itemInArray;
            }
        }

        if (node.children.length) {
            for (var child of node.children) {
                modifyNode(child, itemInArray, true);
            }
        }
    }

    return node;
}

// generate clone for each item in array
// ammount and indexes are optional
function generateClones(node, array) {
    let docFragment = doc.createDocumentFragment();

    for (var i = 0; i < array.length; i++) {
        let nodeClone = node.cloneNode(true);

        let modifiedNodeClone = modifyNode(nodeClone, array[i]);

        modifiedNodeClone = cleanCustomAttributes(modifiedNodeClone);

        docFragment.appendChild(modifiedNodeClone);
    }

    return docFragment;
}

// generates a single clone from a given node
// params :
//  node  = html element to be cloned
//  array = array containing information used to fill the node
//  index = index to retrieve information from array
function generateCloneForIndex(node, array, index) {
    let nodeClone = node.cloneNode(true);

    let modifiedNodeClone = modifyNode(nodeClone, array[index]);

    modifiedNodeClone = cleanCustomAttributes(modifiedNodeClone);

    return modifiedNodeClone;
}

function cleanCustomAttributes(node) {
  node.removeAttribute('hidden');
  node.removeAttribute('bind-value');
  node.removeAttribute('repeat');
  node.removeAttribute('inner');
  return node;
}

  return {
      number ,
      string ,
      boolean ,
      object ,
      array
    };

})();

// Expose custom types
let {array, boolean, number, object, string} = customTypes;
