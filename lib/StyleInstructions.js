var path = require('path'),
    fs = require('fs'),
    carto = require('carto');

var StyleInstructions = function(styleFile){
  this.styleFile = styleFile;
}

StyleInstructions.prototype.create = function(scriptFile){
  var data = fs.readFileSync(this.styleFile);
  var parser = carto.Parser();
  var root = parser.parse(data.toString());
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
  return result.join("\n");
}

StyleInstructions.prototype.renderRule = function(item,intend){
  var ruleIndex,
  condition_start = '',
  condition_stop = '',
  subRule = '',
  result = [],
  selectorIndex = 0,
  elementIndex = 0,
  conditions = [],
  selectorValue,
  operationValue;

  if (typeof item.selectors!=='undefined'){
    if (item.selectors.length>0){
      conditions = [];
      for(selectorIndex=0;selectorIndex<item.selectors.length;selectorIndex++){

        if (typeof item.selectors[selectorIndex].elements === 'object'){
          for(elementIndex=0;elementIndex<item.selectors[selectorIndex].elements.length;elementIndex++){
            selectorValue = "";
            if (typeof item.selectors[selectorIndex].elements[elementIndex].clean === 'string'){
              selectorValue = item.selectors[selectorIndex].elements[elementIndex].clean;
            }else if (typeof item.selectors[selectorIndex].elements[elementIndex].value === 'string'){
              selectorValue = item.selectors[selectorIndex].elements[elementIndex].value;
            }
            conditions.push(' ( selector === "'+selectorValue+'" ) ');
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
            conditions.push(' ( tags[\''+filter.filters[f].key.value+'\'] '+operationValue+' '+selectorValue+' ) ');
          }
        }

        if (typeof item.selectors[selectorIndex].zoom === 'object'){
          for(elementIndex=0;elementIndex<item.selectors[selectorIndex].zoom.length;elementIndex++){
            selectorValue = "''";
            //console.log(item.selectors[selectorIndex].zoom[elementIndex]);
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
