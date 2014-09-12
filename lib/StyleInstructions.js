"use strict";
var path = require('path'),
    fs = require('fs'),
    carto = require('carto');

var StyleInstructions = function(styleFile){
  this.styleFile = styleFile;
}

StyleInstructions.prototype.getTree = function(){
  var data = fs.readFileSync(this.styleFile);
  var parser = carto.Parser();
  var root = parser.parse(data.toString());
  return root;
}

StyleInstructions.prototype.create = function(scriptFile){
  var root = this.getTree();
  if (typeof scriptFile==='undefined'){
    return this.toJS(root);
  }else{
    fs.writeFileSync(scriptFile,this.toJS(root));
  }
}



StyleInstructions.prototype.toJS = function(root){
  var result = [],intend='  ';
  result.push('exports.style = function (selector,tags,zoom) {');
  result.push(intend+'  var variables = {};');
  result.push(intend+'  var style = {};');
  result.push(this.renderRule(root,intend));
  result.push(' return style;');
  result.push('}');

  result.push('exports.filter = function (zoom) {');
  result.push(intend+'  var variables = {};');
  result.push(intend+'  var filter = [];');
  result.push(this.renderFilter(root,intend));
  result.push(' return filter;');
  result.push('}');

  return result.join("\n");
}

StyleInstructions.prototype.zoomSelectors = function(selectors){
  var i,
      op,
      val,
      condition = [];
  for(i=0;i<selectors.length;i++){
    if (typeof selectors[i].value === 'object'){
      val = ""+selectors[i].value.value+""
    }

    if (typeof selectors[i].value === 'string'){
      val = "'"+selectors[i].value+"'"
    }
    if (typeof selectors[i].value === 'number'){
      val = " "+selectors[i].value+" "
    }
    op = this.getOperator(selectors[i].op);
    condition.push(' ( zoom '+op+' '+val+' ) ');
  }

  return '('+condition.join(' && ')+')';

}


StyleInstructions.prototype.renderElementFilter = function(selectors){
  var i,
      op,
      val,
      condition = [];
  for(i=0;i<selectors.length;i++){
    if (typeof selectors[i].value === 'object'){
      val = ""+selectors[i].value.value+""
    }else if (typeof selectors[i].clean === 'string'){
      val = "'"+selectors[i].clean+"'"
    }else if (typeof selectors[i].value === 'string'){
      val = "'"+selectors[i].value+"'"
    }else if (typeof selectors[i].value === 'number'){
      val = " "+selectors[i].value+" "
    }
    condition.push(' ( selector === '+val+' ) ');
  }

  return '('+condition.join(' && ')+')';

}

StyleInstructions.prototype.renderFiltersSelector = function(filters){
  var i,
      op,
      val,
      key,
      condition = [];
  for(i in filters){
    if (typeof filters[i].key === 'object'){
      key = ""+filters[i].key.value+""
    }

    if (typeof filters[i].val.value === 'string'){
      val = "'"+filters[i].val.value+"'"
    }
    if (typeof filters[i].val.value === 'number'){
      val = " "+filters[i].val.value+" "
    }
    op = this.getOperator(filters[i].op);
    if (val==="'ALL'"){
      val = "''";
      op = "!="
    }
    condition.push(' ( tags[\''+key+'\'] '+op+' '+val+' ) ');
  }

  return '('+condition.join(' && ')+')';
}



StyleInstructions.prototype.renderSelectors = function(selectors){
  var i,
      item,
      condition = [];
  for(i=0;i<selectors.length;i++){
    if (selectors[i].elements.length>0){
      item = this.renderElementFilter(selectors[i].elements);
      if (item!=='()'){
        condition.push(item);
      }
    }
    if (selectors[i].zoom.length>0){
      item = this.zoomSelectors(selectors[i].zoom);
      if (item!=='()'){
        condition.push(item);
      }
    }

    if (typeof selectors[i].filters==='object'){
      if (typeof selectors[i].filters.filters==='object'){
        item = this.renderFiltersSelector(selectors[i].filters.filters);
        if (item!=='()'){
          condition.push(item);
        }
      }
    }
  }
  return '('+condition.join(' || ')+')';
}


StyleInstructions.prototype.renderRule = function(item,intend){
  var ruleIndex,
  subRule = '',
  result = [],
  selectorIndex = 0,
  elementIndex = 0,
  conditions = [],
  and_conditions = [],
  selectorValue,
  cond_item,
  operationValue;



  if (typeof item.selectors!=='undefined'){
    if (item.selectors.length>0){
      conditions = [];
      cond_item = this.renderSelectors(item.selectors,false);
      if (cond_item!=='()'){
        conditions.push(cond_item);
      }

      if (conditions.length>0){
        result.push(intend+'if ('+conditions.join(' && ')+'){');
        intend+='  ';
      }

    }else{
      //empty_selector
    }
  }

  if (typeof item.rules!=='undefined'){
    for( ruleIndex = 0; ruleIndex < item.rules.length; ruleIndex++ ){
      subRule = this.renderRule( item.rules[ruleIndex], intend + '  ' );

      if (subRule.length>0){
        result.push( subRule );
      }
    }
  }

  if ( (typeof item.variable === 'boolean') && ( item.variable === true ) ){
    result.push( intend + 'variables["'+item.name+'"] = ' + this.getValue(item) + ';' );
  }

  if ( (typeof item.variable === 'boolean') && ( item.variable === false ) ){
    result.push( intend + 'style["'+item.name+'"] = ' + this.getValue(item) + ';' );
  }


  if (conditions.length>0){
    intend = intend.substring(0,intend.length-2);
    result.push(intend+'}');
  }
  return (result.length>0) ? result.join("\n") : '';
}



StyleInstructions.prototype.renderFilter = function(item,intend){
  var ruleIndex,
  subRule = '',
  result = [],
  selectorIndex = 0,
  elementIndex = 0,
  conditions = [],
  filters = [],
  selectorValue,
  operationValue;


  if (typeof item.selectors!=='undefined'){
    if (item.selectors.length>0){


      conditions = [];
      filters = [];
      for(selectorIndex=0;selectorIndex<item.selectors.length;selectorIndex++){

        if (typeof item.selectors[selectorIndex].elements === 'object'){
          for(elementIndex=0;elementIndex<item.selectors[selectorIndex].elements.length;elementIndex++){
            selectorValue = "";
            if (typeof item.selectors[selectorIndex].elements[elementIndex].clean === 'string'){
              selectorValue = item.selectors[selectorIndex].elements[elementIndex].clean;
            }else if (typeof item.selectors[selectorIndex].elements[elementIndex].value === 'string'){
              selectorValue = item.selectors[selectorIndex].elements[elementIndex].value;
            }
            //conditions.push(' ( selector === "'+selectorValue+'" ) ');
          } // for elementIndex
        }

        if (typeof item.selectors[selectorIndex].filters === 'object'){
          var filter = item.selectors[selectorIndex].filters;
          for(var f in filter.filters){
            operationValue = this.getOperator(filter.filters[f].op);
            selectorValue = "''";
            if (typeof filter.filters[f].val.value === 'string'){
              selectorValue = "'"+filter.filters[f].val.value+"'";
            }
            if (typeof filter.filters[f].val.value === 'number'){
              selectorValue = " "+filter.filters[f].val.value+" ";
            }
            if (selectorValue==='\'ALL\''){
              //conditions.push(' (typeof tags[\''+filter.filters[f].key.value+'\']===\'string\') ');
              filters.push({
                tag: filter.filters[f].key.value,
                comp: '<>',
                value: "''"
              });
            }else{
              //conditions.push(' ( tags[\''+filter.filters[f].key.value+'\'] '+operationValue+' '+selectorValue+' ) ');
              filters.push({
                tag: filter.filters[f].key.value,
                comp: operationValue,
                value: selectorValue
              });
            }
          }
        }

        if (typeof item.selectors[selectorIndex].zoom === 'object'){
          for(elementIndex=0;elementIndex<item.selectors[selectorIndex].zoom.length;elementIndex++){
            selectorValue = "''";
            //console.log(item.selectors[selectorIndex].zoom[elementIndex]);
            if (typeof item.selectors[selectorIndex].zoom[elementIndex].value === 'object'){
              selectorValue = ""+item.selectors[selectorIndex].zoom[elementIndex].value.value+""
            }
            if (typeof item.selectors[selectorIndex].zoom[elementIndex].value === 'string'){
              selectorValue = "'"+item.selectors[selectorIndex].zoom[elementIndex].value+"'"
            }
            if (typeof item.selectors[selectorIndex].zoom[elementIndex].value === 'number'){
              selectorValue = " "+item.selectors[selectorIndex].zoom[elementIndex].value+" "
            }
            operationValue = this.getOperator(item.selectors[selectorIndex].zoom[elementIndex].op);
            conditions.push(' ( zoom '+operationValue+' '+selectorValue+' ) ');
          }
        }
      }// for selectorIndex

      if (conditions.length>0){
        result.push(intend+'if ('+conditions.join(' && ')+'){');
        intend+='  ';
      }

    }else{
      //empty_selector
    }
  }
  if (typeof item.rules!=='undefined'){
    for( ruleIndex = 0; ruleIndex < item.rules.length; ruleIndex++ ){
      subRule = this.renderFilter( item.rules[ruleIndex], intend + '  ' );
      if (subRule.length>0){
        result.push( subRule );
      }
    }
  }

  if ( (typeof item.variable === 'boolean') && ( item.variable === true ) ){
    result.push( intend + 'variables["'+item.name+'"] = ' + this.getValue(item) + ';' );
  }

  for(var f in filters){
    result.push( intend + 'filter.push('+JSON.stringify(filters[f])+')');
  }


  if (conditions.length>0){
    intend = intend.substring(0,intend.length-2);
    result.push(intend+'}');
  }
  return (result.length>0) ? result.join("\n") : '';
}

StyleInstructions.prototype.getOperator = function(op){
  var operationValue;
  switch(op){
    case "=":
      operationValue = ' === ';
      break;
    default:
      operationValue = op;
  }
  return operationValue;
}

StyleInstructions.prototype.getValue = function(item){

  try{
    if (typeof item.value.value[0].value[0].value === 'string'){
      return '"'+item.value.value[0].value[0].value+'"';
    }

    if (typeof item.value.value[0].value[0].value === 'number'){
      return ''+item.value.value[0].value[0].value+'';
    }

    if (typeof item.value.value[0].value[0].name === 'string'){
      return 'variables["'+item.value.value[0].value[0].name+'"]';
    }

    if (typeof item.value.value[0].value[0].rgb === 'object'){
      var colors = item.value.value[0].value[0].rgb;
          colors.push( item.value.value[0].value[0].alpha );
      return '"rgba('+ colors.join(',') +')"';
    }
  }catch(e){
    console.log(item.value);
    return 'error';
  }
}

exports.StyleInstructions = StyleInstructions;
