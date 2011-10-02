//PROTOTYPE
Element.prototype.hasClassName = function(name) {
  return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
};
Element.prototype.addClassName = function(name) {
  if (!this.hasClassName(name)) {
    this.className = this.className ? [this.className, name].join(' ') : name;
  }
};
//CORE
(function(window,document, undefined){
  //cache HTML
  var HTML = {
      escene        : document.getElementById('escene')
      ,escenePoints : document.getElementById('escene').getElementsByTagName('a')
      ,sections     : document.getElementById('escene').getElementsByTagName('section')
      ,food         : document.getElementById('foods')
      ,foods        : document.getElementById('foods').getElementsByTagName('span')
      ,treasure     : document.getElementById('treasure')
      ,treasures    : document.getElementById('treasure').getElementsByTagName('b')
      ,pen          : document.getElementById('pen')
      ,hormiga      : document.getElementById('hormiga')
      ,hormigaImg   : document.getElementById('hormiga').getElementsByTagName('img')
      ,end          : document.getElementById('end')
      ,canvas       : document.getElementById("canvas")
      ,canvasContext: document.getElementById("canvas").getContext('2d')
  };
  var level             = 0;
  var controlPoint      = 0;
  var errorPoint        = false;
  var hoverpoint        = false;//esto es para saber cuando está por encima y disparar la salida
  var hoverpointIndex   = -1;
  var paintStart        = false;
  var widthCanvas       = HTML.canvas.offsetWidth;
  var points=[];

  //methods
  var drag          = function(e){
      var x, y;
      x = e.x;
      y = e.y;
      if (!paintStart) {
          HTML.canvasContext.beginPath();
          HTML.canvasContext.lineJoin     = "round";
          HTML.canvasContext.lineWidth    = 10;
          HTML.canvasContext.strokeStyle  = "#585454";
          HTML.canvasContext.moveTo(x, y);
          paintStart                      = true;
        } else {
          HTML.canvasContext.lineTo(x, y);
          HTML.canvasContext.stroke();
        }
  };
  var startDrag     = function(e){

  };//press sobre el de icono
  var endDrag       = function(e){
      if(errorPoint){
          error(0);
      }else if( controlPoint === points[level].length ){
          good();
      }else{
          error(1);
      }
      controlPoint                  = 0;
      errorPoint                    = false;
      HTML.canvas.style.width       = '1px';
      HTML.canvas.style.height      = '1px';
      HTML.canvas.width             = 1;
      HTML.canvasContext.closePath();
      paintStart                    = false;

  };//release sobre el de icono
  var checkPoint        = function(e){
      var pointIndex    = this.getAttribute('data-point');
      if( controlPoint == pointIndex ){
          controlPoint++;
      }else{
          errorPoint    = true;
      }
  }
  var checkPointManual  = function(position){
      var status        = 0;//0=sigue moviento;1=siguiente POI;2=error POI
      var map           = points[level];
      var inpoint       = false;
      var i             = map.length;
      while(i--){
          if( ( position.x >map[i].x && position.x < (map[i].x+50) ) &&
                ( position.y >map[i].y && position.y < (map[i].y+50) ) ){
                hoverpoint          = true;
                inpoint             = true;
                hoverpointIndex     = i;
          }
      }
      if(hoverpoint && !inpoint){
          if(hoverpointIndex > -1){
              status                = 2;
          }
          if(hoverpointIndex === controlPoint){
              status                = 1;
          }
          hoverpointIndex           = -1;
          hoverpoint                = false;
      }
      return status;
  };
  var nextLevel         = function(){
      HTML.sections[level].style.display='none';
      level++;
      if(level === HTML.sections.length ){
          animateEnd();
          return;
      }
      HTML.sections[level].style.display    ='block';

      if( HTML.pen ){
          var raw                           = HTML.sections[level].getAttribute('data-start').split(',');
          HTML.pen.style.top                = raw[1]+'px';
          HTML.pen.style.left               = raw[0]+'px';
      }
  };
  var good              = function(){
      animateGood();
      nextLevel();
  };
  var error             = function(){
      animateError();
  };
    var animateGood     = function(){
        var bgPosition,
            food,
            foodIndex       = HTML.sections[level].getAttribute('data-food')
            ,treasure
            ,treasureIndex  = HTML.sections[level].getAttribute('data-treasure');
        if(foodIndex){
            foodIndex                       = parseInt(foodIndex,10);
            food                            = HTML.foods[foodIndex];
            bgPosition                      = (foodIndex+1)*60;
            food.style.backgroundPosition   = '-'+bgPosition+'px 0px';
        }
        if(treasureIndex){
            treasureIndex                   = parseInt(treasureIndex);
            treasure                        = HTML.treasures[treasureIndex];
            bgPosition                      = (treasureIndex+1)*80;
            treasure.style.backgroundPosition   = '-'+bgPosition+'px 0px';
            treasure.addClassName('good');
        }
        HTML.hormigaImg[0].src              = 'media/hormigaMayorOk.png';
        setTimeout(animateReset, 1000);
    };
    var animateError    = function(){
        HTML.hormigaImg[0].src              ='media/hormigaMayorError.png';
        setTimeout(animateReset, 1000);
    };
    var animateReset    = function(){
        HTML.hormigaImg[0].src              = 'media/hormigaMayor.png';
        HTML.canvas.width                   = widthCanvas
        HTML.canvas.style.width             = widthCanvas+'px'
        HTML.canvas.style.height            = '300px';
    }
    var animateEnd      = function(){
        HTML.escene.style.display           = 'none';
        HTML.end.style.display              = 'block';
        HTML.treasures[4].style.width       = "160px"
    }


  //AddEvents
  HTML.pen.addEventListener('drag', drag, false);
  HTML.pen.addEventListener('dragend', endDrag, false);
  HTML.pen.addEventListener('dragstart', startDrag, false);
  [].forEach.call(HTML.escenePoints, function(point) {
      point.addEventListener('dragenter', checkPoint, false);
  });
  [].forEach.call(HTML.sections , function(escenario){
      var pois = escenario.getElementsByTagName('a');
      var coordenadas=[];
      [].forEach.call(pois, function(p){
          var x = parseInt( p.style.left );
          var y = parseInt( p.style.top );
          var poi={x:x,y:y};
          coordenadas.push(poi);
      });
      points.push(coordenadas);
  });
  HTML.canvas.addEventListener('touchstart', startDrag);
  HTML.canvas.addEventListener('touchmove', function(e){
      var status = checkPointManual({x:e.touches[0].pageX,y:e.touches[0].pageY});
      if( status == 1 ){
          controlPoint++;
      }else if(status==2){
          errorPoint    = true;
      }
      e.x               = e.touches[0].pageX;
      e.y               = e.touches[0].pageY;
      drag(e);
      e.preventDefault();
  });
  HTML.canvas.addEventListener('touchend', endDrag, false);
  HTML.canvas.width = widthCanvas;

  if( navigator.platform.indexOf('iPad') !== -1 ||
    navigator.platform.indexOf('armv') !== -1){
    HTML.pen.style.display = 'none';
  }
})(window,document);
