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
  , accelPeriod = 50
  , sensitivity = 200
  , pressLeft = []
  , pressRight = []

var yargs = require('yargs')
           .usage('Use your TI SensorTag to control your mac.\nUsage: $0 --verbose --left-key [key1] --right-key [key] --mouse --acc-period [period] --mouse-sensitivity [sensitivity]')
           .boolean(['v', 'm'])
           .alias('v', 'verbose')
           .describe('v', 'verbose output')
           .alias('l', 'left-key')
           .alias('r', 'right-key')
           .describe('l','press [key] using the left button.')
           .default('l', leftKey)
           .describe('r','press [key] using the right button.')
           .default('r', rightKey)
           .alias('m', 'mouse')
           .describe('m', 'enable mouse support')
           .alias('a', 'acc-period')
           .default('a', accelPeriod)
           .describe('a', 'accelerometer measurement update period in ms')
           .alias('s', 'mouse-sensitivity')
           .default('s', sensitivity)
           .describe('s', 'mouse sensitivity')
           .alias('h', 'help')
           .describe('h', 'print this help');

if (yargs.argv.h) {
  console.log(yargs.help())
  process.exit(-1)
}

var sm = new ShiftReg(4);
var mouseEnabled = false;
var debounce = false;
var debounceTime = 2000;

if (yargs.argv.l instanceof Array) {
  pressLeft.push(yargs.argv.l)
} else {
  pressLeft = [yargs.argv.l]
}

pressLeft.forEach(validateKey);

if (yargs.argv.r instanceof Array) {
  pressRight.push(yargs.argv.r)
} else {
  pressRight = [yargs.argv.r]
}

pressRight.forEach(validateKey);

if(!isInt(yargs.argv.a) || yargs.argv.a<1 || yargs.argv.a>2000){
    console.log('period must be integer from 1 to 2000 ms\n\n');
    console.log(yargs.help());
    process.exit(-1);
}

if(!isInt(yargs.argv.s) || yargs.argv.s == 0){
    console.log('sensitivity must be integer and not null\n\n');
    console.log(yargs.help());
    process.exit(-1);
}


debug('searching for a sensor tag')


SensorTag.discover(function(sensorTag) {
  debug('discovered', sensorTag.uuid)

  sensorTag.connect(function() {
    debug('connected');
    sensorTag.discoverServicesAndCharacteristics(function() {
        console.log('aaa')
      if (yargs.argv.v) {
        debug('discovered all characteristics');
      }
      sensorTag.notifySimpleKey(function() {
        if (yargs.argv.v) {
          debug('simplekey notify correctly set up')
        }
      });

      if(yargs.argv.m){
        sensorTag.setAccelerometerPeriod(yargs.argv.a, function(){
          if (yargs.argv.v) {
            debug('accelerometer period set to', accelPeriod)
          }
        });

        sensorTag.enableIrTemperature(function() {
          if (yargs.argv.v) {
            debug('ir temperature enabled')
          }
        });

        sensorTag.notifyIrTemperature(function() {
          if (yargs.argv.v) {
            debug('ir temperature notify correctly set up')
          }
        })
      }
    });
  })


  sensorTag.on('simpleKeyChange', function(left, right) {
    if (left) {
      if (yargs.argv.v) {
        debug('left pressed')
      }
      pressLeft.forEach(press);
    } else if (right) {
      if (yargs.argv.v) {
        debug('right pressed')
      }
      pressRight.forEach(press);
    }
  });

  sensorTag.on('accelerometerChange', function(x, y, z){
    if (yargs.argv.v) {
      debug('accelerometer:',x, y, z);
    }
    cursor = getPos();
    var rpos = sm.shift(x, y);
    try {
      move(cursor.x + yargs.argv.s*rpos.x, cursor.y + yargs.argv.s*rpos.y);
    }
    catch (err) {
      if (yargs.argv.v) {
        debug(err);
      }
    }
  });
  sensorTag.on('irTemperatureChange', function(objectTemperature, ambientTemperature){
    if (objectTemperature < 0 && !mouseEnabled && !debounce){
      sensorTag.enableAccelerometer(function() {
        if (yargs.argv.v) {
          debug('accelerometer enabled')
        }
      });
      sensorTag.notifyAccelerometer(function() {
        if (yargs.argv.v) {
          debug('accelerometer notify correctly set up')
        }
      });
      mouseEnabled = true;
      debounce = true;
      setTimeout(function(){debounce=false;}, debounceTime);
    };
    if (objectTemperature < 0 && mouseEnabled && !debounce){
      sensorTag.disableAccelerometer(function() {
        if (yargs.argv.v) {
          debug('accelerometer disabled')
        }
      });
      sensorTag.unnotifyAccelerometer(function() {
        if (yargs.argv.v) {
          debug('accelerometer notify disabled')
        }
      });
      mouseEnabled = false;
      debounce = true;
      setTimeout(function(){debounce=false;}, debounceTime);
    };
  });

});

function isInt(n) {
   return typeof n === 'number' && n % 1 == 0;
}

function validateKey(key){
    if(!isInt(key) || key<0 || key>127){
    console.log('keys must be integer from 0 to 127\n\n');
    console.log(yargs.help());
    process.exit(-1);
  }
}


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


