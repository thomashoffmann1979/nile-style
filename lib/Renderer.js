"use strict";
var Canvas = require('canvas'),
    TextLinePath = require('./textonpath').TextLinePath,

    Image = Canvas.Image,
    Font = Canvas.Font,
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
  this._devicePixelRatio = 2;
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
  var canvas = new Canvas(this._size * this._devicePixelRatio , this._size * this._devicePixelRatio),
      i=0,
      item,
      out,
      stream,
      mapCoords,
      devicePixelRatio = this._devicePixelRatio,
      c=0,
      data = this._data;
/*
  if (devicePixelRatio !== 1) {
    //canvas.style.width = this._size + 'px';
    //canvas.style.height = this._size + 'px';
    canvas.width = this._size;// * devicePixelRatio;
    canvas.height = this._size;// * devicePixelRatio;
  }
  */
  this.ctx = canvas.getContext('2d');


  this.ctx.imageSmoothingEnabled =true;
  this.canvas = canvas;
  //try{
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
                  if (c<2){
                    this.renderPolygon(data.features[i].coordinates,data.features[i].properties,c);
                  }
                  break;
                case 'Polygon':
                  if (c<2){
                    this.renderPolygon(data.features[i].coordinates,data.features[i].properties,c);
                  }
                  if (c===2){
                    this.renderPolygonText(data.features[i].coordinates,data.features[i].properties,c,'Polygon',data.features[i].reprpoint,data.features[i].bbox);
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
                    this.renderPathText(data.features[i].coordinates,data.features[i].properties,c);
//                    this.textOnPath(data.features[i].coordinates,data.features[i].properties,c,'Line');
                  }
                  break;
                default:
                  //console.log(data.features[i].type,'not processed',__dirname);
              }
            }
          }
        }
      }
      this.ctx.scale(1/devicePixelRatio, 1/devicePixelRatio);
    }
  //}catch(e){
  //  callback(e);
  //}
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
Renderer.prototype.pathAngelsAndPosition = function(coordinates,txt){
  var points = [],
      angels = [],
      lengths = [],
      items = [],
      len = 0,
      i,
      hypotenuse,
      ankathete,
      gegenkathete,
      rad_angel,
      ctx = this.ctx,
      degree_corection = 0;


  for(i=1;i<coordinates.length;i++){
    ankathete = coordinates[i][0] - coordinates[i-1][0];
    gegenkathete = coordinates[i][1] - coordinates[i-1][1];
    hypotenuse = Math.sqrt(ankathete*ankathete + gegenkathete*gegenkathete);
    len+=hypotenuse;

    if (ankathete >= 0){
      rad_angel =  Math.asin(gegenkathete/hypotenuse);
      angels.push( rad_angel   );
    }else{
      if (gegenkathete >= 0){
        rad_angel =  Math.acos(ankathete/hypotenuse);
        angels.push( rad_angel   );
      }else{
        rad_angel =  Math.acos(ankathete/hypotenuse);
        angels.push( rad_angel + Math.asin( 90 * Math.PI/180 )  );
      }
    }
    points.push([coordinates[i-1][0],coordinates[i-1][1]]);
    lengths.push(hypotenuse);
  }



  return {
    len: len,
    points: points,
    angels: angels,
    lengths: lengths
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
      text_part,
      current_text_index,
      draw = false,
      fontFamily,
      ctx=this.ctx;

  if(typeof selector === 'undefined'){
    selector = 'Line';
  }
  style = this._style(selector,tags,this._zoom);

  if (typeof style['text-position'] === 'string'){
    draw = true;
  }

  if (draw){
    this.setStyles(style);

    if (typeof tags[style['text-tag']]==='string'){
      fontFamily = ( (style['text-font-family'])?style['text-font-family']:'Arial' );
      ctx.font =  ( (style['text-size'])?style['text-size']:12 )*this.meterScale + "px "+fontFamily;
      txt = '    '+tags[style['text-tag']];//'       '++'       ';

      ctx.lineWidth  = (style['text-halo-width'])?style['text-halo-width']:0.0001;
      ctx.strokeStyle = (style['text-halo-color'])?style['text-halo-color']:'transparent';
      ctx.fillStyle = (style['text-color'])?style['text-color']:'transparent';

      drawText(ctx,txt,coordinates,this.scale,this._size);
      //var tp = new TextLinePath(ctx,txt,coordinates,ctxStyle,this.scale);
      //tp.draw();
    }
  }
}


var getAngle = function(x1,y1,x2,y2){
  var a = x2-x1;
  var b = y2-y1;

  var c = Math.sqrt(a*a+b*b);
  if ( x1 > x2){
    return Math.asin( (y1-y2) /c) - Math.PI ;
  }else{
    return Math.asin( (y2-y1) /c); //+ Math.asin( 90 * Math.PI/180 );
  }

}
var getLength = function(x1,y1,x2,y2){
  var a = x2-x1;
  var b = y2-y1;
  var c = Math.sqrt(a*a+b*b);
  return c;
}

var drawText = function(ctx,text,data,scale,size){
  var m=data.length,
      i,
      l,
      textLength = (text)?text.length:0,
      char = '',
      pathSequence = 0,
      nextPathSequence = 0,
      w = 0,
      currentX = 0,
      sequenceLength = [],
      strategie = 0;


  w = ctx.measureText(text).width;

  for(i=0;i<m;i++){
    data[i][0]*=scale;
    data[i][1]*=scale;
    if (i>0){
      currentX = getLength(
        data[i-1][0] ,
        data[i-1][1] ,
        data[i][0] ,
        data[i][1]
      );
      if (currentX>w){
        strategie = 1;
        pathSequence = i-1;
      }
      sequenceLength.push(w);
      l += currentX;
    }
  }
  currentX = 0;
  if (w > l){
    return; // text does not fit on complete path
  }





  //text = text.substring(0,text.length-5);
  ctx.textBaseline='middle';

  if (m >0){


    if (strategie===1){
      ctx.save();
      ctx.translate( data[pathSequence][0] ,data[pathSequence][1]  );
      ctx.rotate(getAngle(
        data[pathSequence][0] ,
        data[pathSequence][1] ,
        data[pathSequence+1][0] ,
        data[pathSequence+1][1]
      ));

      ctx.strokeText(text,currentX,0);
      ctx.fillText(text,currentX,0);

      //ctx.translate( -1 * data[pathSequence][0]*scale, -1 * data[pathSequence][1]*scale );
      ctx.translate(
        -1*data[pathSequence][0] ,
        -1*data[pathSequence][1]
      );

      ctx.restore();
    }else{


      currentX = ctx.measureText(text).width; // padding to the begin of the path

      l = 0;
      pathSequence = 0;
      // simple check if the hole text fits on the path sequences
      for(i=0; ( ( i<textLength ) && ( (pathSequence+1)<m) ) ;i++){
        char = text.charAt(i);
        w = ctx.measureText(char).width;
        l = getLength(
          data[pathSequence][0] ,
          data[pathSequence][1] ,
          data[pathSequence+1][0] ,
          data[pathSequence+1][1]
        );
        if (currentX + w > l){
            pathSequence++;
            currentX=0;
        }
        if (pathSequence+1===m){
          return;
        }
        if (
          (data[pathSequence][0]<0) ||
          (data[pathSequence][1]<0) ||
          (data[pathSequence][0]>size) ||
          (data[pathSequence][1]>size)
        ){
          return;
        }
        currentX+=w;
      }

      l = 0;
      pathSequence = 0;
      currentX = ctx.measureText(text).width; // padding to the begin of the path

      for(i=0; ( ( i<textLength ) && ( (pathSequence+1)<m) ) ;i++){
        //console.log('OK');

        char = text.charAt(i);
        w = ctx.measureText(char).width;
        l = getLength(
          data[pathSequence][0] ,
          data[pathSequence][1] ,
          data[pathSequence+1][0] ,
          data[pathSequence+1][1]
        );

        if (currentX + w > l){
            pathSequence++;
            currentX=0;
        }

        if (pathSequence+1===m){
          return;
        }
        ctx.save();



        ctx.translate( data[pathSequence][0] ,data[pathSequence][1]  );


        ctx.rotate(getAngle(
          data[pathSequence][0] ,
          data[pathSequence][1] ,
          data[pathSequence+1][0] ,
          data[pathSequence+1][1]
        ));

        if(false){
          ctx.beginPath();
          //ctx.strokeStyle = 'red';
          //ctx.lineWidth = 1;
          ctx.moveTo(0,0);
          ctx.lineTo(l,0);
          ctx.stroke();
        }

        ctx.strokeText(char,currentX,0);
        ctx.fillText(char,currentX,0);

        //ctx.translate( -1 * data[pathSequence][0]*scale, -1 * data[pathSequence][1]*scale );
        ctx.translate(
          -1*data[pathSequence][0] ,
          -1*data[pathSequence][1]
        );

        ctx.restore();
        currentX+=w;

      }

    }


  }
  //ctx.save();
}

Renderer.prototype.getBBox = function(coordinates){
  var i,
      j,
      m=coordinates.length,
      box={x1:0,y1:0,x2:0,y2:0,w:0,h:0},
      min_x=Infinity,
      min_y=Infinity,
      max_x=0,max_y=0,
      c;



  for(i=0;i<m;i++){
    if (coordinates[i][0]>max_x){
      max_x = coordinates[i][0];
    }
    if (coordinates[i][1]>max_y){
      max_y = coordinates[i][1];
    }
    if (coordinates[i][0]<min_x){
      min_x = coordinates[i][0];
    }
    if (coordinates[i][1]<min_y){
      min_y = coordinates[i][1];
    }
  }

  box.x1 = min_x*this.scale;
  box.x2 = max_x*this.scale;
  box.y1 = min_y*this.scale;
  box.y2 = max_y*this.scale;
  box.w = box.x2-box.x1;
  box.h = box.y2-box.y1;

  return box;
}

Renderer.prototype.renderPolygonText = function(coordinates,tags,contour,selector,point,bbox){
  var style,
      i,
      j,
      x,
      y,
      w,
      h,
      txt,
      fontFamily,
      draw = false,
      ctx=this.ctx,
      box=this.getBBox(bbox[0]);

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
      if (typeof tags[style['text-tag']]==='string'){
        txt = tags[style['text-tag']];
        this.setStyles(style,box.w,txt);
        //console.log('render polygon text',txt);
        if (typeof style['text-halo-color'] !== 'undefined'){
          ctx.strokeStyle = style['text-halo-color'];
          ctx.lineWidth = (style['text-halo-width'])?style['text-halo-width']:1;

          //ctx.textAlign='center';
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

Renderer.prototype.setStyles = function(styles,boxWidth,text) {
  var i,
      fontFamily,
      additionalScale=1,
      w,
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

  if (typeof text==='string'){
    if (typeof styles['text-opacity'] === 'number'){
      ctx.globalAlpha = styles['text-opacity'];
    }
  }

  fontFamily = ( (styles['text-font-family'])?styles['text-font-family']:'sans-serif' );

  if (typeof styles['text-size'] === 'number'){
    if (styles['text-size-unit'] === 'meter'){
      styles['text-size']*=this.meterScale;
    }else if (styles['text-size-unit'] === '%'){
      if ( (typeof boxWidth==='number') && (typeof text==='string') ){
        ctx.font =  "10px "+fontFamily;
        w =  ctx.measureText(text).width;
        //console.log('***','size',styles['text-size'],'boxwidth',boxWidth,'text30width',w,'ratio',(boxWidth/w),'meterscale',this.meterScale);
        styles['text-size'] = 10 * (boxWidth/w) * (styles['text-size']/100);
        //console.log('==>',styles['text-size']);
      }else{

      }

    }
  }


  ctx.font =  ( (styles['text-size'])?styles['text-size']:12 ) + "px "+fontFamily;



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
