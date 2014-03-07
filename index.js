#!/usr/bin/env node
if (!process.env.DEBUG)
  process.env.DEBUG = 'blue'

var debug = require('debug')('blue')
  , SensorTag = require('sensortag')
  , press = require('mac-key-press').press
  , move = require('mac-key-press').move
  , getPos = require('mac-key-press').getPos
  , leftKey = 123
  , rightKey = 124
  , accelPeriod = 100
  , sensitivity = 200/accelPeriod

var sm = new ShiftReg(4);
var mouseEnabled = false;
var debounce = false;
var debounceTime = 2000;

debug('searching for a sensor tag')

SensorTag.discover(function(sensorTag) {
  debug('discovered', sensorTag.uuid)

  sensorTag.connect(function() {
    debug('connected')
    sensorTag.discoverServicesAndCharacteristics(function() {
      debug('discovered all characteristics')
      sensorTag.notifySimpleKey(function() {
        debug('simplekey notify correctly set up')
      });
      sensorTag.setAccelerometerPeriod(accelPeriod, function(){
        debug('accelerometer period set to', accelPeriod)
      });
      sensorTag.enableIrTemperature(function() {
        debug('ir temperature enabled')
      });
      sensorTag.notifyIrTemperature(function() {
        debug('ir temperature notify correctly set up')
      })
    });
  })


  sensorTag.on('simpleKeyChange', function(left, right) {
    if (left) {
      debug('left pressed')
      press(leftKey)
    } else if (right) {
      debug('right pressed')
      press(rightKey)
      press(36) // return
    }
  });

  sensorTag.on('accelerometerChange', function(x, y, z){
    //debug('accelerometer:',x, y, z);
    cursor = getPos();
    var rpos = sm.shift(x, y);
    try {
      move(cursor.x + sensitivity*rpos.x*accelPeriod, cursor.y + sensitivity*rpos.y*accelPeriod);
    }
    catch (err) {
      debug(err);
    }
  });
  sensorTag.on('irTemperatureChange', function(objectTemperature, ambientTemperature){
    // debug('temp', objectTemperature, ambientTemperature);
    if (objectTemperature < 0 && !mouseEnabled && !debounce){
      sensorTag.enableAccelerometer(function() {
        debug('accelerometer enabled')
      });
      sensorTag.notifyAccelerometer(function() {
        debug('accelerometer notify correctly set up')
      });
      mouseEnabled = true;
      debounce = true;
      setTimeout(function(){debounce=false;}, debounceTime);
    };
    if (objectTemperature < 0 && mouseEnabled && !debounce){
      sensorTag.disableAccelerometer(function() {
        debug('accelerometer disabled')
      });
      sensorTag.unnotifyAccelerometer(function() {
        debug('accelerometer notify disabled')
      });
      mouseEnabled = false;
      debounce = true;
      setTimeout(function(){debounce=false;}, debounceTime);
    };
    previousSgn = objectTemperature/objectTemperature;
  });

});



function ShiftReg(len){
  this.x = new Array();
  this.y = new Array();
  for (var i = (len - 1) || 4; i >= 0; i--) {
    this.x[i] = 0;
    this.y[i] = 0;
  };
}

ShiftReg.prototype.shift = function(x, y){
  this.x.unshift(x);
  this.x.pop();
  this.y.unshift(y);
  this.y.pop();
  return this.smooth();
}

ShiftReg.prototype.smooth = function(){
  var smoothed = new Object();
  smoothed.x = 0;
  smoothed.y = 0;
  for (var i=this.x.length - 1; i >= 0; i--) {
    smoothed.x+=this.x[i];
    smoothed.y+=this.y[i];
  };
  smoothed.x/=this.x.length;
  smoothed.y/=this.y.length;
  return smoothed;
}


