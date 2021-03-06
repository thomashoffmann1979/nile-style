exports.style = function (selector,tags,zoom) {
    var variables = {};
    var style = {};
    variables["@sans"] = "Aythaya";
    variables["@sans_italic"] = "Source Sans Pro Italic";
    variables["@sans_bold"] = "Source Sans Pro Semibold";
    variables["@land"] = "rgba(255,255,238,1)";
    variables["@water"] = "rgba(195,230,255,1)";
    variables["@mainroad"] = "rgb(255,250,190)";
    variables["@builings"] = "rgb(210,222,222)";
    if ((( ( selector === 'Map' ) ))){
        style["fill-color"] = variables["@land"];
    }
    if ((( ( selector === 'Polygon' ) ))){
        if ((( ( zoom > 13 ) ))){
            if ((( ( tags['building'] != '' ) ))){
                style["antialias"] = "subpixel";
                style["color"] = "rgba(255,0,0,1)";
                style["z-index"] = 200;
                style["line-width"] = 1;
                style["text-position"] = "path";
                style["text-tag"] = "building";
                style["text-size"] = 9;
                style["text-color"] = "rgba(0,128,0,1)";
            }
        }
    }
    if ((( ( selector === 'Line' ) ))){
        style["z-index"] = 100;
        if ((( ( zoom >= 15 ) ))){
            if ((( ( tags['highway'] != '' ) ))){
                style["color"] = "rgba(255,0,0,1)";
                style["z-index"] = 100;
                style["line-width"] = 2;
                style["contour-color"] = "rgba(0,0,128,1)";
                style["contour-width"] = 1;
                style["text-position"] = "path";
                style["text-tag"] = "name";
                style["text-size"] = 15;
                style["text-color"] = "rgba(0,0,0,1)";
                style["text-halo-color"] = "rgba(255,255,255,1)";
                style["text-halo-width"] = 0.3;
            }
            if ((( ( tags['highway']  ===  'track' ) ) || ( ( tags['highway']  ===  'service' ) ))){
                style["color"] = "rgba(255,255,255,1)";
                style["z-index"] = 110;
                style["line-width"] = 3;
                style["contour-color"] = "rgba(0,0,0,1)";
                style["contour-width"] = 1;
            }
        }
        if ((( ( zoom >= 14 ) ))){
            if ((( ( tags['highway']  ===  'service' ) ))){
                style["color"] = "rgba(255,255,255,1)";
                style["z-index"] = 120;
                style["line-width"] = 3;
                style["contour-color"] = "rgba(0,0,0,1)";
                style["contour-width"] = 1;
                style["text-position"] = "path";
                style["text-tag"] = "name";
                style["text-size"] = 15;
                style["text-color"] = "rgba(0,0,0,1)";
                style["text-halo-color"] = "rgba(255,255,255,1)";
                style["text-halo-width"] = 0.3;
            }
            if ((( ( tags['highway']  ===  'residential' ) ))){
                style["color"] = variables["@mainroad"];
                style["z-index"] = 130;
                style["line-width"] = 8;
                style["contour-color"] = "rgba(0,0,0,1)";
                style["contour-width"] = 1;
                style["text-position"] = "path";
                style["text-tag"] = "name";
                style["text-size"] = 15;
                style["text-color"] = "rgba(0,0,0,1)";
                style["text-halo-color"] = "rgba(255,255,255,1)";
                style["text-halo-width"] = 0.3;
            }
        }
        if ((( ( zoom >= 10 ) ))){
            if ((( ( tags['highway']  ===  'primary' ) ))){
                style["color"] = variables["@mainroad"];
                style["line-width"] = 9;
                style["contour-color"] = "rgba(0,0,0,1)";
                style["contour-width"] = 1;
                style["text-position"] = "path";
                style["text-tag"] = "name";
                style["text-size"] = 15;
                style["text-color"] = "rgba(0,0,0,1)";
                style["text-halo-color"] = "rgba(255,255,255,1)";
                style["text-halo-width"] = 0.3;
            }
            if ((( ( tags['highway']  ===  'secondary' ) ))){
                style["color"] = variables["@mainroad"];
                style["z-index"] = 125;
                style["line-width"] = 12;
                style["contour-color"] = "rgba(0,0,0,1)";
                style["contour-width"] = 1;
                style["text-position"] = "path";
                style["text-tag"] = "name";
                style["text-size"] = 15;
                style["text-color"] = "rgba(0,0,0,1)";
                style["text-halo-color"] = "rgba(255,255,255,1)";
                style["text-halo-width"] = 0.3;
            }
        }
        if ((( ( tags['bridge']  ===  'yes' ) ))){
            style["contour-color"] = "rgba(0,0,0,1)";
            style["contour-width"] = 3;
        }
        if ((( ( tags['tunnel']  ===  'yes' ) ))){
            style["opacity"] = 0.5;
            style["contour-color"] = "rgba(0,0,255,1)";
            style["contour-width"] = 3;
        }
        if ((( ( tags['highway']  ===  'motorway' ) ))){
            style["color"] = "rgba(128,0,128,1)";
            style["z-index"] = 130;
            style["line-width"] = 30;
            style["contour-color"] = "rgba(255,165,0,1)";
            style["contour-width"] = 1;
            style["text-position"] = "path";
            style["text-tag"] = "name";
            style["text-size"] = 15;
            style["text-color"] = "rgba(0,0,0,1)";
            style["text-halo-color"] = "rgba(255,255,255,1)";
            style["text-halo-width"] = 0.3;
        }
    }
    if ((( ( selector === 'Polygon' ) ))){
        style["z-index"] = 10;
        if ((( ( tags['landuse']  ===  'farmland' ) ))){
            style["fill-color"] = "rgb(130,180,30)";
            style["opacity"] = 1;
            style["line-width"] = "none";
            style["color"] = "rgba(0,255,255,1)";
        }
        if ((( ( zoom < 10 ) ))){
            if ((( ( tags['boundary']  ===  'administrative' ) ))){
                style["line-width"] = 0.5;
                style["color"] = "rgb(255,0,0)";
            }
        }
        if ((( ( zoom > 12 ) ))){
            if ((( ( tags['building']  ===  'yes' ) ))){
                style["line-width"] = 0.5;
                style["color"] = "rgba(0,0,0,1)";
                style["fill-color"] = variables["@builings"];
                style["text-font-family"] = variables["@sans"];
                style["text-position"] = "path";
                style["text-tag"] = "addr:housenumber";
                style["text-size"] = 19;
                style["text-color"] = "rgba(0,0,255,1)";
                style["text-halo-color"] = "rgba(255,255,255,1)";
                style["text-halo-width"] = 1;
            }
        }
    }
 return style;
}
exports.filter = function (zoom) {
    var variables = {};
    var filter = [];
    variables["@sans"] = "Aythaya";
    variables["@sans_italic"] = "Source Sans Pro Italic";
    variables["@sans_bold"] = "Source Sans Pro Semibold";
    variables["@land"] = "rgba(255,255,238,1,1)";
    variables["@water"] = "rgba(195,230,255,1,1)";
    variables["@mainroad"] = "rgb(255,250,190)";
    variables["@builings"] = "rgb(210,222,222)";
      if ( ( zoom > 13 ) ){
          filter.push({"tag":"building","comp":"<>","value":"''"})
      }
      if ( ( zoom >= 15 ) ){
          filter.push({"tag":"highway","comp":"<>","value":"''"})
          filter.push({"tag":"highway","comp":" === ","value":"'track'"})
          filter.push({"tag":"highway","comp":" === ","value":"'service'"})
      }
      if ( ( zoom >= 14 ) ){
          filter.push({"tag":"highway","comp":" === ","value":"'service'"})
          filter.push({"tag":"highway","comp":" === ","value":"'residential'"})
      }
      if ( ( zoom >= 10 ) ){
          filter.push({"tag":"highway","comp":" === ","value":"'primary'"})
          filter.push({"tag":"highway","comp":" === ","value":"'secondary'"})
      }
      filter.push({"tag":"bridge","comp":" === ","value":"'yes'"})
      filter.push({"tag":"tunnel","comp":" === ","value":"'yes'"})
      filter.push({"tag":"highway","comp":" === ","value":"'motorway'"})
      filter.push({"tag":"landuse","comp":" === ","value":"'farmland'"})
      if ( ( zoom < 10 ) ){
          filter.push({"tag":"boundary","comp":" === ","value":"'administrative'"})
      }
      if ( ( zoom > 12 ) ){
          filter.push({"tag":"building","comp":" === ","value":"'yes'"})
      }
 return filter;
}