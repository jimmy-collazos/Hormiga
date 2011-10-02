Element.prototype.hasClassName = function(name) {
  return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
};
Element.prototype.addClassName = function(name) {
  if (!this.hasClassName(name)) {
    this.className = this.className ? [this.className, name].join(' ') : name;
  }
};
Element.prototype.removeClassName = function(name) {
  if (this.hasClassName(name)) {
    var c           = this.className;
    this.className  = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
  }
};
//CORE
(function(window, undefined){
              //cache HTML
              var HTML = {
                  escene    : document.getElementById('escene')
                  ,escenePoints : document.getElementById('escene').getElementsByTagName('a')
                  ,sections : document.getElementById('escene').getElementsByTagName('section')
                  ,food     : document.getElementById('foods')
                  ,foods    : document.getElementById('foods').getElementsByTagName('span')
                  ,treasures    : document.getElementById('treasure')
                  ,treasure     : document.getElementById('treasure').getElementsByTagName('b')
                  ,pen      : document.getElementById('pen')
                  ,homriga  : document.getElementById('hormiga')
                  ,end      : document.getElementById('end')
                  ,canvas   : document.getElementById("canvas")
                  ,canvasContext: document.getElementById("canvas").getContext('2d')
              };
              var level             = 0;
              var controlPoint      = 0;
              var errorPoint        = false;
              ////esto se resetea en cada level
              var hoverpoint        = false;//esto es para saber cuando está por encima y disparar la salida
              var hoverpointIndex   = -1;
              var paintStart        = false;
              var pintPointLast     = {x:0,y:0};
              //cada grupo de points es un nivel
              //luego rendereo esto para posicionar los puntos en casa escenario
              //a:es para saber si tiene premio [0|1]
              var points        = [
                  [{x:50,y:50,a:0},{x:100,y:50,a:0},{x:150,y:50,a:0},{x:200,y:50,a:0}]
                  ,[{x:50,y:50,a:0},{x:100,y:100,a:0},{x:150,y:150,a:0},{x:200,y:200,a:0}]
                  ,[{x:50,y:50,a:0},{x:100,y:100,a:0},{x:150,y:50,a:0},{x:200,y:50,a:0},{x:250,y:50,a:0}]
              ];

              //methods
              var drag          = function(e){
                  var x, y;
                  //console.log(e)
                  x = e.x;
                  y = e.y;
                  if (!paintStart) {
                      HTML.canvasContext.beginPath();
                      HTML.canvasContext.moveTo(x, y);
                      
                      paintStart = true;
                    } else {
                      HTML.canvasContext.lineTo(x, y);
                      HTML.canvasContext.stroke();
                    }
              };
              var startDrag     = function(e){
                HTML.canvasContext.lineJoin = "round";
                HTML.canvasContext.lineWidth = 10;
                HTML.canvasContext.strokeStyle = "#585454";
                console.log('start');
              };//press sobre el de icono
              var endDrag       = function(e){
                  /*
                  console.log('validando el nivel:', level);
                  console.log('points de este nivel', points[level]);
                  console.log('valorando control',controlPoint, points[level].length);
                  */
                  if(errorPoint){
                      error(0);
                      console.error('ha pasado en un orden inadecuado');
                  }else if( controlPoint === points[level].length ){
                      good();
                      console.info('todo ha ido perfectamente');
                  }else{
                      error(1);
                      console.error(' se ha perdido o no ha llegado a su destino ');
                  }
                  controlPoint  = 0;
                  errorPoint    = false;
                  HTML.canvasContext.closePath();
                  HTML.canvas.width = HTML.canvas.width;


              };//release sobre el de icono
              var checkPoint        = function(e){
                  var pointIndex = this.getAttribute('data-point');
                  if( controlPoint == pointIndex ){
                      controlPoint++;
                  }else{
                      errorPoint = true;
                  }
              }
              var checkPointManual    = function(position){
                  var status        = 0;//0=sigue moviento;1=siguiente POI;2=error POI
                  var map           = points[level];
                  var inpoint       = false;
                  var i             = map.length;
                  while(i--){
                      if( ( position.x >map[i].x && position.x < (map[i].x+20) ) &&
                            ( position.y >map[i].y && position.y < (map[i].y+20) ) ){
                            hoverpoint      = true;
                            inpoint         = true;
                            hoverpointIndex = i;
                      }
                  }
                  if(hoverpoint && !inpoint){
                      if(hoverpointIndex > -1){
                          status        = 2;
                      }
                      if(hoverpointIndex === controlPoint){
                          status        = 1;
                      }
                      hoverpointIndex   = -1;
                      hoverpoint        = false;
                  }
                  return status;
              };
              var nextLevel         = function(){
                  HTML.sections[level].style.display='none';
                  level++;
                  if(level === HTML.sections.length ){
                      animateEnd();
                      console.log('llega al final de pantalla');
                      return;
                  }



                  HTML.sections[level].style.display='block';
                  console.log('Pasando al nivel: ', level);
              };
              var good              = function(){
                  animateGood();
                  nextLevel();
              };
              var error             = function(){
                  animateError();
              };
                var animateGood     = function(){
                    HTML.homriga.removeClassName('error');
                    HTML.homriga.addClassName('good');
                    HTML.foods[level].addClassName('good');
                    setTimeout(animateReset, 1000);
                };
                var animateError    = function(){
                    HTML.homriga.removeClassName('good');
                    HTML.homriga.addClassName('error');
                    setTimeout(animateReset, 1000);
                };
                var animateReset    = function(){
                    HTML.homriga.removeClassName('good');
                    HTML.homriga.removeClassName('error');
                }
                var animateEnd      = function(){
                    HTML.escene.style.display='none';
                    HTML.end.style.display='block';
                }


              //AddEvents
              HTML.pen.addEventListener('drag', drag, false);
              HTML.pen.addEventListener('dragend', endDrag, false);
              HTML.pen.addEventListener('dragstart', startDrag, false);
              [].forEach.call(HTML.escenePoints, function(point) {
                  point.addEventListener('dragenter', checkPoint, false);
              });
              
              HTML.canvas.addEventListener('touchstart', startDrag);
              HTML.canvas.addEventListener('touchmove', function(e){
                  var status = checkPointManual({x:e.touches[0].pageX,y:e.touches[0].pageY});
                  if( status == 1 ){
                      controlPoint++;
                  }else if(status==2){
                      errorPoint = true;
                  }
                  drag();
                  e.preventDefault();
              });
              HTML.canvas.addEventListener('touchend', endDrag, false);
              HTML.canvas.width = HTML.canvas.offsetWidth;
              
              




          })(window);
