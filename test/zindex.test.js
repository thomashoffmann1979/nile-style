var Canvas = require('canvas'),
Image = Canvas.Image,
fs = require('fs'),
path = require('path'),
zoom = 15,
data = JSON.parse(fs.readFileSync(path.join( __dirname, 'layer.geojson' ))),
size = 1024,
nilecss = require('../lib/main');

StyleInstructions = require('../lib/StyleInstructions').StyleInstructions;
Renderer = require('../lib/Renderer').Renderer;

styleInstructions = new StyleInstructions(path.join(__dirname,'style.less'));
styleInstructions.create(path.join(__dirname,'style.js'));

var mystyle = require('./style').style;

//nilecss.makeJS(path.join(__dirname,'style.ccss'),path.join(__dirname,'style.js'));

var renderer = new Renderer(mystyle, 1724, 15, data);
renderer.orderZIndex();

renderer.render(path.join(__dirname,'zindex.test.png'),function(err){
  if (err){
    console.log(err);
  }else{
    console.log('we are done');
  }
});
