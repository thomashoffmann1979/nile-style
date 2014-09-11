var Canvas = require('canvas'),
Image = Canvas.Image,
fs = require('fs'),
path = require('path'),
zoom = 15,
data = JSON.parse(fs.readFileSync(path.join( __dirname, 'test.geojson' ))),
size = 512,
nilecss = require('../lib/main');

StyleInstructions = require('../lib/StyleInstructions').StyleInstructions;
Renderer = require('../lib/Renderer').Renderer;

styleInstructions = new StyleInstructions(path.join(__dirname,'style.less'));
styleInstructions.create(path.join(__dirname,'style.js'));
var mystyle = require('./style').style;

//nilecss.makeJS(path.join(__dirname,'style.ccss'),path.join(__dirname,'style.js'));

var renderer = new Renderer(mystyle, 512, 15, data);
renderer.render(path.join(__dirname,'style-test.png'),function(err){
  if (err){
    console.log(err);
  }else{
    console.log('we are done');
  }
});

/*
var propertyMap = {
  "z-index": "zIndex",

  "opacity": "globalAlpha",
  "fill-opacity": "globalAlpha",

  "line-width": "lineWidth",
  "line-cap": "lineCap",
  "line-join": "lineJoin",

  "text-align": "textAlign",
  "text-baseline": "textBaseline",

  "color": "strokeStyle",
  "fill-color": "fillStyle",

  "line-width": "lineJoin"
};

var canvas = new Canvas(size, size),
ctx = canvas.getContext('2d');
granularity = 100;
scale = 1;

var out = fs.createWriteStream(path.join(__dirname,'style-test.png')),
stream = canvas.pngStream();;


stream.on('data', function(chunk){
  out.write(chunk);
});

stream.on('error', function(chunk){
  //out.write(chunk);
  console.log('kothic error',arguments);
});

out.on('close', function(chunk){
  console.log('ready');
});

stream.on('end', function(chunk){
  out.end();
});

function render(data){
  var i=0,
  item;

  granularity = data.granularity;
  scale = size/granularity;

  if (typeof data.features === 'object'){
    for(i=0;i<data.features.length;i++){
      if (typeof data.features[i].type === 'string'){
        if (typeof data.features[i].properties === 'object'){
          switch(data.features[i].type){
            case 'Polygon':
              renderPolygon(data.features[i].coordinates,data.features[i].properties);
              break;
            case 'MultiLineString':
              renderMultiPath(data.features[i].coordinates,data.features[i].properties);
              break;
            case 'LineString':
              renderPath(data.features[i].coordinates,data.features[i].properties);
              break;
            default:
              console.log(data.features[i].type,'not processed',__dirname);
          }
        }
      }
    }
  }
}

function renderPath(coordinates,tags){
  var style = Style('Line',tags,zoom),
  i,j,x,y;
  ctx.save();
  if (JSON.stringify(style) !== '{}' ){
    setStyles(style);
    ctx.beginPath();
    for(i=0; i < coordinates.length; i++){

      x = coordinates[i][0]*scale;
      y = coordinates[i][1]*scale;
      if (j===0){
        ctx.moveTo(x,y);
      }else{
        ctx.lineTo(x,y);
      }
    }
    ctx.stroke();
  }
}

function renderMultiPath(coordinates,tags){
  var style = Style('Line',tags,zoom),
  i,j,x,y;
  ctx.save();
  if (JSON.stringify(style) !== '{}' ){
    setStyles(style);
    for(i=0; i < coordinates.length; i++){

      ctx.beginPath();
      for(j=0; j < coordinates[i].length; j++){
        x = coordinates[i][j][0]*scale;
        y = coordinates[i][j][1]*scale;
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


function renderPolygon(coordinates,tags){
  var style = Style('Polygon',tags,zoom),
  i,j,x,y;
  ctx.save();

  if (JSON.stringify(style) !== '{}' ){

    setStyles(style);
    for(i=0; i < coordinates.length; i++){

      if (
        (coordinates[i].length === 5)&&
        (coordinates[i][0][0] === 0)&&
        (coordinates[i][0][1] === granularity)&&
        (coordinates[i][1][0] === 0)&&
        (coordinates[i][1][1] === 0)&&
        (coordinates[i][2][0] === granularity)&&
        (coordinates[i][2][1] === 0)&&
        (coordinates[i][3][0] === granularity)&&
        (coordinates[i][3][1] === granularity)&&
        (coordinates[i][4][0] === 0)&&
        (coordinates[i][4][1] === granularity)
      ){
        // bounding box
      }else{

        ctx.beginPath();
        for(j=0; j < coordinates[i].length; j++){
          x = coordinates[i][j][0]*scale;
          y = coordinates[i][j][1]*scale;
          if (j===0){
            ctx.moveTo(x,y);
          }else{
            ctx.lineTo(x,y);
          }
        }
        if (typeof style['fill-color'] !== 'undefined'){
          ctx.fill();
        }
        ctx.stroke();
      }
    }
  }
}

function switchPropertyName(name){
  return (typeof propertyMap[name] === 'string' )? propertyMap[name] : name;
}

function setStyles(styles) {
  var i;
  ctx.globalAlpha = 1;
  for (i in styles) {
    if (styles.hasOwnProperty(i)) {
      ctx[switchPropertyName(i)] = styles[i];
    }
  }
}
*/
