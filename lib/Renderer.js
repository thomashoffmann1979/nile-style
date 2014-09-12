"use strict";
var Canvas = require('canvas'),
    Image = Canvas.Image,
    fs = require('fs'),
    path = require('path'),
    propertyMap = {
      "z-index": "zIndex",

      "background-color": "fillStyle",

      "opacity": "globalAlpha",
      "fill-opacity": "globalAlpha",

      "line-width": "lineWidth",
      "line-cap": "lineCap",
      "line-join": "lineJoin",

      "text-align": "textAlign",
      "text-baseline": "textBaseline",

      "color": "strokeStyle",
      "fill-color": "fillStyle"

    };

var Renderer = function(style, size, zoom, data){
  this._style = function(){return {};};
  this._size = 512;
  this._zoom = 15;
  this._data = {};

  if (typeof style==='function'){
    this._style = style;
  }

  if (typeof size==='number'){
    this._size = size;
  }

  if (typeof zoom==='number'){
    this._zoom = zoom;
  }

  if (typeof data==='object'){
    this._data = data;
  }

}

Renderer.prototype.orderZIndex = function(){
  var i,
      data = this._data,
      style = {},
      mapping = {},
      keys,
      index;
  if (typeof data.features === 'object'){
    for(i=0;i<data.features.length;i++){
      if (typeof data.features[i].type === 'string'){
        if (typeof data.features[i].properties === 'object'){
          switch(data.features[i].type){
            case 'MultiPolygon':
            case 'Polygon':
              style = this._style('Polygon',data.features[i].properties,this._zoom);
              break;
            case 'MultiLineString':
            case 'LineString':
              style = this._style('Line',data.features[i].properties,this._zoom);
              break;
            default:
              //console.log(data.features[i].type,'not processed',__dirname);
          }

          index = 0;
          if (typeof style['z-index']==='number'){
            index = style['z-index'];
          }
          index = 100000 + index;
          if (typeof mapping['I'+index] === 'undefined'){
            mapping['I'+index] = [];
          }
          mapping['I'+index].push(data.features[i]);
        }
      }
    }

    keys = Object.keys(mapping),
    keys.sort();
    data.features = [];
    for (i = 0; i < keys.length; i++)
    {
        data.features = data.features.concat( mapping[ keys[i] ] );
    }

  }
}

Renderer.prototype.render = function(fileName,callback) {
  var canvas = new Canvas(this._size, this._size),
      i=0,
      item,
      out,
      stream,
      mapCoords,
      c=0,
      data = this._data;

  this.ctx = canvas.getContext('2d');

  try{
    out = fs.createWriteStream(fileName),
    stream = canvas.pngStream();
    stream.on('data', function(chunk){
      out.write(chunk);
    });

    stream.on('error', function(chunk){
      if (typeof callback==='function'){
        callback('error');
      }
    });

    out.on('close', function(chunk){
      if (typeof callback==='function'){
        process.nextTick( function(){
          callback(false);
        })
      }
    });

    stream.on('end', function(chunk){
      out.end();
    });




    this.granularity = data.granularity;
    this.scale = this._size/this.granularity;
    this.meterScale = this._size/this.lonlat2meters(data.bbox[0],data.bbox[1],data.bbox[2],data.bbox[3]);

    mapCoords = [
      [
        [
          0,
          this.granularity
        ],
        [
          0,
          0
        ],
        [
          this.granularity,
          0
        ],
        [
          this.granularity,
          this.granularity
        ],
        [
          0,
          this.granularity
        ]
      ]
    ];

    this.renderPolygon(mapCoords,{},false,'Map');


    if (typeof data.features === 'object'){
      for(c=0;c<3;c++){
        for(i=0;i<data.features.length;i++){
          if (typeof data.features[i].type === 'string'){
            if (typeof data.features[i].properties === 'object'){
              switch(data.features[i].type){
                case 'MultiPolygon':
                case 'Polygon':
                  if (c<2){
                    this.renderPolygon(data.features[i].coordinates,data.features[i].properties,c);
                  }
                  if (c===2){
                    this.renderPolygonText(data.features[i].coordinates,data.features[i].properties,c,'Polygon',data.features[i].reprpoint);
                  }
                  break;
                case 'MultiLineString':
                  if (c<2){
                    this.renderMultiPath(data.features[i].coordinates,data.features[i].properties,c);
                  }
                  break;
                case 'LineString':
                  if (c<2){
                    this.renderPath(data.features[i].coordinates,data.features[i].properties,c);
                  }else{
                    this.renderPathText(data.features[i].coordinates,data.features[i].properties,c,'Line');
                  }
                  break;
                default:
                  //console.log(data.features[i].type,'not processed',__dirname);
              }
            }
          }
        }
      }
    }
  }catch(e){
    callback(e);
  }
}

Renderer.prototype.renderPath = function(coordinates,tags,contour){
  var style = this._style('Line',tags,this._zoom),
      i,
      j,
      x,
      y,
      draw=true,
      ctx=this.ctx;


  if (JSON.stringify(style) === '{}' ){
    draw=false;
  }
  if (contour===0){
    if ((typeof style['contour-width'] === 'undefined') || (typeof style['contour-color'] === 'undefined')){
      draw=false;
    }else{
      style['line-width'] = ((style['line-width'])?style['line-width']:0) + (style['contour-width']*2);
      style['color'] = style['contour-color'];
    }
  }

  if (draw){


    this.setStyles(style);
    ctx.beginPath();
    for(i=0; i < coordinates.length; i++){

      x = coordinates[i][0]*this.scale;
      y = coordinates[i][1]*this.scale;
      if (j===0){
        ctx.moveTo(x,y);
      }else{
        ctx.lineTo(x,y);
      }

    }
    ctx.stroke();
  }
}


Renderer.prototype.renderMultiPath = function(coordinates,tags,contour){
  var style = this._style('Line',tags,this._zoom),
      i,
      j,
      x,
      y,
      draw = true,
      ctx=this.ctx;


  if (JSON.stringify(style) === '{}' ){
    draw=false;
  }
  if (contour===0){
    if ((typeof style['contour-width'] === 'undefined') || (typeof style['contour-color'] === 'undefined')){
      draw=false;
    }else{
      style['line-width'] = ((style['line-width'])?style['line-width']:0) + (style['contour-width']*2);
      style['color'] = style['contour-color'];
    }
  }

  if (draw){
    this.setStyles(style);
    if (ctx.lineWidth >= 1){ // draw only if we can see it
      for(i=0; i < coordinates.length; i++){

        ctx.beginPath();
        for(j=0; j < coordinates[i].length; j++){
          x = coordinates[i][j][0]*this.scale;
          y = coordinates[i][j][1]*this.scale;
          if (j===0){
            ctx.moveTo(x,y);
          }else{
            ctx.lineTo(x,y);
          }
        }
        ctx.stroke();
      }
    }
  }
}




Renderer.prototype.renderPolygon = function(coordinates,tags,contour,selector){

  var style,
      i,
      j,
      x,
      y,
      draw = true,
      ctx=this.ctx;

  if(typeof selector === 'undefined'){
    selector = 'Polygon';
  }

  style = this._style(selector,tags,this._zoom);

  if (JSON.stringify(style) === '{}' ){
    draw=false;
  }
  if (contour===0){
    draw=false;
  }
  if (draw){
    this.setStyles(style);
    for(i=0; i < coordinates.length; i++){

        ctx.beginPath();
        for(j=0; j < coordinates[i].length; j++){
          x = coordinates[i][j][0]*this.scale;
          y = coordinates[i][j][1]*this.scale;

          if (j===0){
            ctx.moveTo(x,y);
          }else{
            ctx.lineTo(x,y);
          }
        }
        if (typeof style['fill-color'] !== 'undefined'){
          ctx.fill();
        }

        if (ctx.lineWidth !== 0){
          ctx.stroke();
        }
      }

  }
}


Renderer.prototype.renderPathText = function(coordinates,tags,contour,selector){
  var style,
      i,
      j,
      x,
      y,
      w,
      h,
      txt,
      draw = false,
      ctx=this.ctx;

  if(typeof selector === 'undefined'){
    selector = 'Line';
  }
  style = this._style(selector,tags,this._zoom);
  
  if (typeof style['text-position'] === 'string'){
    draw = true;
  }

  if (draw){



      x = coordinates[0][0]*this.scale;
      y = coordinates[0][1]*this.scale;

      ctx.font =  ( (style['text-size'])?style['text-size']:12 )  + "px Arial";


      if (typeof style['text-halo-color'] !== 'undefined'){
        ctx.strokeStyle = style['text-halo-color'];
        ctx.lineWidth = (style['text-halo-width'])?style['text-halo-width']:1;
        if (typeof tags[style['text-tag']]==='string'){
          txt = tags[style['text-tag']];
          //w = ctx.measureText(txt).width;
          //h = ctx.measureText(txt).emHeightAscent ;
          ctx.strokeText(txt,x ,y );
        }
      }

      if (typeof style['text-color'] !== 'undefined'){
        ctx.fillStyle = style['text-color'];
        if (typeof tags[style['text-tag']]==='string'){
          txt = tags[style['text-tag']];
          w = ctx.measureText(txt).width;
          h = ctx.measureText(txt).emHeightAscent ;
          ctx.fillText(txt,x - w/2,y + h/2);
        }
      }


  }

}




Renderer.prototype.renderPolygonText = function(coordinates,tags,contour,selector,point){
  var style,
      i,
      j,
      x,
      y,
      w,
      h,
      txt,
      draw = false,
      ctx=this.ctx;

  if(typeof selector === 'undefined'){
    selector = 'Polygon';
  }
  style = this._style(selector,tags,this._zoom);

  if (typeof style['text-position'] === 'string'){
    draw = true;
  }



  if (draw){

    if (point){

      x = point[0]*this.scale;
      y = point[1]*this.scale;
      ctx.font =  ( (style['text-size'])?style['text-size']:12 )*this.meterScale + "px Arial";


      if (typeof style['text-halo-color'] !== 'undefined'){
        ctx.strokeStyle = style['text-halo-color'];
        ctx.lineWidth = (style['text-halo-width'])?style['text-halo-width']:1;
        if (typeof tags[style['text-tag']]==='string'){
          txt = tags[style['text-tag']];
          w = ctx.measureText(txt).width;
          h = ctx.measureText(txt).emHeightAscent ;
          ctx.strokeText(txt,x - w/2,y + h/2);
        }
      }

      if (typeof style['text-color'] !== 'undefined'){
        ctx.fillStyle = style['text-color'];
        if (typeof tags[style['text-tag']]==='string'){
          txt = tags[style['text-tag']];
          w = ctx.measureText(txt).width;
          h = ctx.measureText(txt).emHeightAscent ;
          ctx.fillText(txt,x - w/2,y + h/2);
        }
      }

    }
  }

}






Renderer.prototype.switchPropertyName = function(name){
  return (typeof propertyMap[name] === 'string' )? propertyMap[name] : name;
}

Renderer.prototype.setStyles = function(styles) {
  var i,
      ctx = this.ctx;

  ctx.globalAlpha = 1;
  ctx.lineWidth = 0.00001; //
  //console.log(ctx.lineWidth );
  ctx.fillStyle = "none";
  ctx.strokeStyle = "none";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (typeof styles['line-width-unit'] === 'undefined'){
    styles['line-width-unit'] = 'meter';
  }
  if (typeof styles['text-halo-width-unit'] === 'undefined'){
    styles['text-halo-width-unit'] = 'meter';
  }

  if (typeof styles['line-width'] === 'number'){
    if (styles['line-width-unit'] === 'meter'){
      styles['line-width']*=this.meterScale;
    }
  }
  if (typeof styles['text-halo-width'] === 'number'){
    if (styles['text-halo-width-unit'] === 'meter'){
      styles['text-halo-width']*=this.meterScale;
    }
  }

  for (i in styles) {
    if (styles.hasOwnProperty(i)) {
      if ( propertyMap.hasOwnProperty(i) ){ // prevent manipulation over stylessheet
        ctx[this.switchPropertyName(i)] = styles[i];
      }
    }
  }
  //console.log(styles);
}







Renderer.prototype.toRad = function(v) {
  return v * Math.PI / 180;
}

Renderer.prototype.lonlat2meters = function(lat1,lon1,lat2,lon2){
  var R = 6371; // km
  var o1 = this.toRad(lat1);
  var o2 = this.toRad(lat2);
  var delta1 = this.toRad(lat2-lat1);
  var delta2 = this.toRad(lon2-lon1);

  var a = Math.sin(delta1/2) * Math.sin(delta1/2) +
          Math.cos(o1) * Math.cos(o2) *
          Math.sin(delta2/2) * Math.sin(delta2/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;

  return d*1000;
}

exports.Renderer = Renderer;
