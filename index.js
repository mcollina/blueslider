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
      sensorTag.enableAccelerometer(function() {
        debug('accelerometer enabled')
      });
      sensorTag.notifyAccelerometer(function() {
        debug('accelerometer notify correctly set up')
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
    move(cursor.x + 500*x, cursor.y + 500*y);
  })
})


