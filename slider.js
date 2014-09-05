
if (!process.env.DEBUG)
  process.env.DEBUG = 'blue'

var debug = require('debug')('blue')
  , SensorTag = require('sensortag')
  , press = require('mac-key-press').press
  , leftKey = 123
  , rightKey = 124
  , graft = require('graft')()
  , through = require('through2')
  , ws = require('graft/ws')
  , devnull = require('dev-null')
  , broker = require('mqstreams')(require('mqemitter')())
  , lastTemp = -1

debug('searching for a sensor tag')

ws
  .server({ port: 8001 })
  .pipe(through.obj(function(req, enc, done) {
    req.session.on('error', function(err) {})
    this.push(req)
    done()
  }))
  .pipe(graft)
  .where({ cmd: 'subscribe' }, through.obj(function(req, enc, done) {
    debug('subscribed', req.msg.topic)
    var stream = broker.readable(req.msg.topic)
    req.session.on('error', function(err) {
      stream.unpipe()
    })
    stream.pipe(req.msg.messages)
    done()
  }))
  .where({ cmd: 'getLastTemp' }, through.obj(function(req, enc, done) {
    req.msg.ret.end(lastTemp)
    done()
  }))
  .pipe(devnull({ objectMode: true }))

SensorTag.discover(function(sensorTag) {
  debug('discovered', sensorTag.uuid)

  sensorTag.connect(function() {
    debug('connected')
    sensorTag.discoverServicesAndCharacteristics(function() {
      debug('discovered all characteristics')
      sensorTag.notifySimpleKey(function() {
        debug('key press correctly setted up')
      })

      sensorTag.enableHumidity(function() {
        sensorTag.notifyHumidity(function() {
          debug('humidity correctly setted up')
        })
      })

      sensorTag.enableIrTemperature(function() {
        sensorTag.notifyIrTemperature(function() {
          debug('ir temperature correctly setted up')
        })
      })
    })
  })

  sensorTag.on('simpleKeyChange', function(left, right) {
    if (left) {
      debug('left pressed')
      //press(leftKey)
      broker.emit({ topic: 'deck/prev' })
    } else if (right) {
      debug('right pressed')
      broker.emit({ topic: 'deck/next' })
      //press(rightKey)
      press(36) // return
    }
  })

  sensorTag.on('humidityChange', function(temperature, humidity) {
    lastTemp = temperature
    broker.emit({ topic: 'sensortag/temperature', value: temperature })
    broker.emit({ topic: 'sensortag/humidity', value: humidity })
  })

  sensorTag.on('irTemperatureChange', function(objectTemperature, ambientTemperature) {
    broker.emit({ topic: 'sensortag/ir/object', value: objectTemperature })
    broker.emit({ topic: 'sensortag/ir/ambient', value: ambientTemperature })
  })
})
