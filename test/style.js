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
        if ( ( tags['highway']  ===  'track' ) ){
            style["color"] = "rgba(0,128,0,1)";
            style["line-width"] = 3;
            style["contour-color"] = "rgba(0,0,0,1)";
            style["contour-width"] = 1;
        }
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
        if ( ( tags['highway']  ===  'motorway' ) ){
            style["color"] = "rgba(255,255,0,1)";
            style["opacity"] = 0.9;
            style["line-width"] = 30;
            style["contour-color"] = "rgba(255,165,0,1)";
            style["contour-width"] = 1;
        }
    }
    if ( ( selector === "Polygon" ) ){
        if ( ( tags['area']  ===  'yes' ) ){
            style["line-width"] = 0.5;
            style["fill-color"] = "rgb(0,0,255)";
            style["opacity"] = 0.3;
        }
        if ( ( tags['landuse']  ===  'farmland' ) ){
            style["fill-color"] = "rgb(0,180,30)";
            style["opacity"] = 1;
            style["line-width"] = "none";
            style["color"] = "rgba(0,255,255,1)";
        }
        if ( ( tags['boundary']  ===  'administrative' ) ){
            style["line-width"] = 0.5;
            style["color"] = "rgb(255,0,0)";
        }
    }
 return style;
}