"use strict";

var flakeApp = (function circles() {
  var sin = Math.sin;
  var cos = Math.cos;
  var PI = Math.PI;
  var random = Math.random;

  function _init() {
    var container = document.getElementById('flakeContainer');
    _maximiseElement(container);
    var width = container.width;
    var height = container.height;

    var drawingElement = document.getElementById('drawing');
    var drawing = SVG(drawingElement);
    var viewbox = drawing.viewbox(0, 0, 210, 148);

    var xMin = 10;
    var yMin = 10;
    var xMax = 200;
    var yMax = 138;
    var snowflakes = [];
    var numberOfFlakes = 100;
    for (var i=0 ; i < numberOfFlakes ; i++) {
      snowflakes.push(_makeNewSnowflake('snowflake_' + i, xMin, yMin, xMax, yMax));
    }

    drawing.rect(210, 148).fill('#FFF').radius(5).move(0, 0);

    var stroke = { color: '#000', width: 0.05, linecap: 'round' }
    var groups = _drawSnowflakes(snowflakes, drawing, stroke);
    var group = drawing.group();
    groups.forEach(function (g) {
      group.add(g);
    });
    group.attr('id', 'snowflakes');

    var b64 = btoa(drawingElement.outerHTML);
    var href = 'data:image/svg+xml;base64,\n'+b64;
    var downloadLink = document.getElementById('downloadLink');
    downloadLink.href = href;
  }

  function _maximiseElement(element) {
    element.height = window.innerHeight;
    element.width = window.innerWidth;
  }

  function _makeNewSnowflake(id, xMin, yMin, xMax, yMax) {
    var width = xMax-xMin;
    var height = yMax-yMin;
    var radius = random() * Math.min(width, height) / 28;
    var x = xMin + (random() * width);
    var y = yMin + (random() * height);
    var angle = random()*PI/6;
    return new Snowflake(id, x, y, radius, angle, _generateFrondLengths); 
  }
  
  function Snowflake(id, x, y, radius, angle, frondGenerator) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._radius = radius;
    this._angle = angle;
    this._frondLengths = frondGenerator(radius);
  }
  Snowflake.prototype = {
    get id() { return this._id; },
    get x() { return this._x; },
    get y() { return this._y; },
    get radius() { return this._radius; },
    get angle() { return this._angle; },
    get frondLengths() { return this._frondLengths; },
    get location() { return [ this._x, this._y ]; }
  };
    
  function _generateFrondLengths(radius) {
    var frondLengths = [];
    var numberOfFronds = 5;
    for (var i=0 ; i<numberOfFronds ; i++) {
      var maxLength = radius - (i+1)*(radius/(numberOfFronds+1));
      var frondLength = random() * maxLength;
      frondLengths.push(frondLength);
    }
    
    return frondLengths;
  }

  function _drawSnowflakes(snowflakes, drawing, stroke) {
    var groups = snowflakes.map(function (snowflake) {
      return _drawSnowflake(snowflake, drawing, stroke);
    });
    return groups;
  }

  function _drawSnowflake(snowflake, drawing, stroke) {
    var lines = [];
    for (var angle = snowflake.angle ; angle < (PI*2)+snowflake.angle ; angle += PI*2/6)  {
      var x = snowflake.x + snowflake.radius * sin(angle);
      var y = snowflake.y + snowflake.radius * cos(angle);
      lines.push(_drawLine(drawing, stroke, snowflake.x, snowflake.y, x, y));
      _drawFronds(snowflake.x, snowflake.y, snowflake.radius, angle, snowflake.frondLengths, drawing, stroke)
        .forEach(function (line) { lines.push(line); });
    }
    var group = drawing.group();
    group.attr('id', snowflake.id);
    lines.forEach(function (line) { group.add(line); });
    return group;
  }

  function _drawFronds(cx, cy, radius, angle, frondLengths, drawing, stroke) {
    var numberOfFronds = frondLengths.length;
    
    var lines = [];
    for (var i=0 ; i<frondLengths.length ; i++) {
      var distanceFromCentre = (radius/(numberOfFronds+1))*(i+1);
      var x1 = cx + distanceFromCentre*sin(angle);
      var y1 = cy + distanceFromCentre*cos(angle);
      var x2 = x1 + frondLengths[i]*sin(angle - PI/6);
      var y2 = y1 + frondLengths[i]*cos(angle - PI/6);
      var x3 = x1 + frondLengths[i]*sin(angle + PI/6);
      var y3 = y1 + frondLengths[i]*cos(angle + PI/6);
      
      lines.push(_drawLine(drawing, stroke, x1, y1, x2, y2));
      lines.push(_drawLine(drawing, stroke, x1, y1, x3, y3));
    }
    return lines;
  }    
  
  function _drawLine(drawing, stroke, x1, y1, x2, y2) {
      return drawing.line(x1, y1, x2, y2).stroke(stroke);
  }
  
  return {
	  init: _init
  };

})();

flakeApp.init();