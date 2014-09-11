exports.style = function (selector,tags,zoom) {
    var variables = {};
    var style = {};
    variables["@sans"] = "Source Sans Pro Regular";
    variables["@sans_italic"] = "Source Sans Pro Italic";
    variables["@sans_bold"] = "Source Sans Pro Semibold";
    variables["@land"] = "rgba(255,255,204,1)";
    variables["@water"] = "rgba(195,230,255,1)";
    if ( ( selector === "Map" ) ){
        style["fill-color"] = variables["@land"];
    }
    if ( ( selector === "Line" ) ){
        if ( ( zoom >= 15 ) ){
            if ( (typeof tags['highway']==='string') ){
                style["color"] = "rgba(144,238,144,1)";
                style["line-width"] = 2;
                style["contour-color"] = "rgba(0,0,128,1)";
                style["contour-width"] = 1;
            }
            if ( ( tags['highway']  ===  'track' ) ){
                style["color"] = "rgba(0,128,0,1)";
                style["line-width"] = 3;
                style["contour-color"] = "rgba(0,0,0,1)";
                style["contour-width"] = 1;
            }
        }
        if ( ( zoom >= 14 ) ){
            if ( ( tags['highway']  ===  'service' ) ){
                style["color"] = "rgba(255,255,255,1)";
                style["line-width"] = 3;
                style["contour-color"] = "rgba(0,0,0,1)";
                style["contour-width"] = 1;
            }
            if ( ( tags['highway']  ===  'residential' ) ){
                style["color"] = "rgba(255,255,0,1)";
                style["opacity"] = 0.9;
                style["line-width"] = 8;
                style["contour-color"] = "rgba(0,0,0,1)";
                style["contour-width"] = 1;
            }
        }
        if ( ( zoom >= 10 ) ){
            if ( ( tags['highway']  ===  'primary' ) ){
                style["color"] = "rgba(255,255,255,1)";
                style["line-width"] = 3;
                style["contour-color"] = "rgba(0,0,0,1)";
                style["contour-width"] = 1;
            }
            if ( ( tags['highway']  ===  'secondary' ) ){
                style["color"] = "rgba(255,255,0,1)";
                style["opacity"] = 0.9;
                style["line-width"] = 8;
                style["contour-color"] = "rgba(0,0,0,1)";
                style["contour-width"] = 1;
            }
        }
        if ( ( tags['highway']  ===  'motorway' ) ){
            style["color"] = "rgba(255,255,0,1)";
            style["opacity"] = 0.9;
            style["line-width"] = 30;
            style["contour-color"] = "rgba(255,165,0,1)";
            style["contour-width"] = 1;
        }
    }
    if ( ( selector === "Polygon" ) ){
        if ( ( tags['landuse']  ===  'farmland' ) ){
            style["fill-color"] = "rgb(130,180,30)";
            style["opacity"] = 1;
            style["line-width"] = "none";
            style["color"] = "rgba(0,255,255,1)";
        }
        if ( ( zoom < 10 ) ){
            if ( ( tags['boundary']  ===  'administrative' ) ){
                style["line-width"] = 0.5;
                style["color"] = "rgb(255,0,0)";
            }
        }
    }
 return style;
}
exports.filter = function (zoom) {
    var variables = {};
    var filter = [];
    variables["@sans"] = "Source Sans Pro Regular";
    variables["@sans_italic"] = "Source Sans Pro Italic";
    variables["@sans_bold"] = "Source Sans Pro Semibold";
    variables["@land"] = "rgba(255,255,204,1,1)";
    variables["@water"] = "rgba(195,230,255,1,1)";
      if ( ( zoom >= 15 ) ){
          filter.push({"tag":"highway","comp":"<>","value":"''"})
          filter.push({"tag":"highway","comp":" === ","value":"'track'"})
      }
      if ( ( zoom >= 14 ) ){
          filter.push({"tag":"highway","comp":" === ","value":"'service'"})
          filter.push({"tag":"highway","comp":" === ","value":"'residential'"})
      }
      if ( ( zoom >= 10 ) ){
          filter.push({"tag":"highway","comp":" === ","value":"'primary'"})
          filter.push({"tag":"highway","comp":" === ","value":"'secondary'"})
      }
      filter.push({"tag":"highway","comp":" === ","value":"'motorway'"})
      filter.push({"tag":"landuse","comp":" === ","value":"'farmland'"})
      if ( ( zoom < 10 ) ){
          filter.push({"tag":"boundary","comp":" === ","value":"'administrative'"})
      }
 return filter;
}