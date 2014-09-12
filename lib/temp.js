
/*
for(selectorIndex=0;selectorIndex<item.selectors.length;selectorIndex++){
  and_conditions = [];
  if (typeof item.selectors[selectorIndex].elements === 'object'){
    for(elementIndex=0;elementIndex<item.selectors[selectorIndex].elements.length;elementIndex++){
      selectorValue = "";
      if (typeof item.selectors[selectorIndex].elements[elementIndex].clean === 'string'){
        selectorValue = item.selectors[selectorIndex].elements[elementIndex].clean;
      }else if (typeof item.selectors[selectorIndex].elements[elementIndex].value === 'string'){
        selectorValue = item.selectors[selectorIndex].elements[elementIndex].value;
      }
      and_conditions.push(' ( selector === "'+selectorValue+'" ) ');
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
        and_conditions.push(' (typeof tags[\''+filter.filters[f].key.value+'\']===\'string\') ');
      }else{
        and_conditions.push(' ( tags[\''+filter.filters[f].key.value+'\'] '+operationValue+' '+selectorValue+' ) ');
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
      and_conditions.push(' ( zoom '+operationValue+' '+selectorValue+' ) ');
    }
  }
  conditions.push(' ('+and_conditions.join(' || ')+') ');
}// for selectorIndex

*/
