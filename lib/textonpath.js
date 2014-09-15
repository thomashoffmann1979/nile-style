
var TextLinePath = function(ctx,text,data,style){
  this.ctx = ctx;
  this.style = style;
  this.text = text;
  this.data = data;
  this.scale = 1;
}

TextLinePath.prototype.draw = function(){
  var ctx = this.ctx,
      data = this.data,
      style = this.style,
      text = this.text,
      m=data.length,
      scale=this.scale,
      i;


//  ctx.restore();
  ctx.antialias = 'subpixel';
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'black';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.font = '30px sans serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
//console.log('TextLinePath',text);

  for(i in style){
    ctx[i] = style[i];
  }



  if (m >0){
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(data[0][0]*scale,data[0][1]*scale);
    for(i=1;i<m;i++){
      ctx.lineTo(data[i][0]*scale,data[i][1]*scale);
    }
    ctx.stroke();
    ctx.restore();
    console.log('OK');

    var textLength = text.length;
    var char = '';
    var pathSequence = 0;
    var nextPathSequence = 0;
    var w = 0;
    var currentX = 0;
    var l = 0;

    for(i=0;i<textLength;i++){
      ctx.save();
      char = text.charAt(i);
      w = ctx.measureText(char).width;
      l = this.getLength(
        data[pathSequence][0]*scale,
        data[pathSequence][1]*scale,
        data[pathSequence+1][0]*scale,
        data[pathSequence+1][1]*scale
      );

      if (currentX + w > l){
          pathSequence++;
          currentX=0;
      }


      ctx.translate(
        data[pathSequence][0]*scale,
        data[pathSequence][1]*scale
      );

      ctx.rotate(this.getAngle(
        data[pathSequence][0]*scale,
        data[pathSequence][1]*scale,
        data[pathSequence+1][0]*scale,
        data[pathSequence+1][1]*scale
      ));

      ctx.strokeText(char,currentX,0);

      ctx.fillText(char,currentX,0);
      currentX+=w;
      ctx.restore();
    }




  }
  //ctx.save();
}

TextLinePath.prototype.getLength = function(x1,y1,x2,y2){
  var a = x2-x1;
  var b = y2-y1;
  var c = Math.sqrt(a*a+b*b);
  return c;
}
TextLinePath.prototype.getAngle = function(x1,y1,x2,y2){
  var a = x2-x1;
  var b = y2-y1;

  var c = Math.sqrt(a*a+b*b);
  if ( a >= 0){
    return Math.acos(a/c);
  }else{
    return Math.asin(a/c) + Math.asin( 90 * Math.PI/180 );
  }

}

exports.TextLinePath = TextLinePath;
