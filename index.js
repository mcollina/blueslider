
if (!process.env.DEBUG)
  process.env.DEBUG = 'blue'

var debug = require('debug')('blue')
  , SensorTag = require('sensortag')
  , press = require('mac-key-press')
  , leftKey = 123
  , rightKey = 124

debug('searching for a sensor tag')

SensorTag.discover(function(sensorTag) {
  debug('discovered', sensorTag.uuid)

  sensorTag.connect(function() {
    debug('connected')
    sensorTag.discoverServicesAndCharacteristics(function() {
      debug('discovered all characteristics')
      sensorTag.notifySimpleKey(function() {
        debug('notify correctly setted up')
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
    }
  })
})
