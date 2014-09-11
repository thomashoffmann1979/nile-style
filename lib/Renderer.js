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
      for(c=0;c<2;c++){
        for(i=0;i<data.features.length;i++){
          if (typeof data.features[i].type === 'string'){
            if (typeof data.features[i].properties === 'object'){
              switch(data.features[i].type){
                case 'MultiPolygon':
                case 'Polygon':
                  this.renderPolygon(data.features[i].coordinates,data.features[i].properties,c==0);
                  break;
                case 'MultiLineString':
                  this.renderMultiPath(data.features[i].coordinates,data.features[i].properties,c==0);
                  break;
                case 'LineString':
                  this.renderPath(data.features[i].coordinates,data.features[i].properties,c==0);
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

  ctx.save();
  if (JSON.stringify(style) === '{}' ){
    draw=false;
  }
  if (contour===true){
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

  ctx.save();
  if (JSON.stringify(style) === '{}' ){
    draw=false;
  }
  if (contour===true){
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
  ctx.save();
  if (JSON.stringify(style) === '{}' ){
    draw=false;
  }
  if (contour===true){
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

  if (typeof styles['line-width'] === 'number'){
    if (styles['line-width-unit'] === 'meter'){
      styles['line-width']*=this.meterScale;
    }
  }
  for (i in styles) {
    if (styles.hasOwnProperty(i)) {
      ctx[this.switchPropertyName(i)] = styles[i];
    }
  }

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
