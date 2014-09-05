
var graft = require('graft')()
  , ws = require('graft/ws');

window.graft = graft;

function buildUpdater(topic, key) {
  var ret = graft.ReadChannel()

  graft.write({
    cmd: 'subscribe',
    topic: topic,
    messages: ret
  })

  function update(msg) {
    var value = msg.value
    var elem = document.querySelector(key)
    if (!elem) {
      console.log('missing', key)
      return;
    }
    value = parseFloat(value) * 100
    elem.innerText = Math.round(value) / 100
  }

  ret.on('data', update)
}

function buildExecutor(deck) {
  var ret = graft.ReadChannel()

  graft.write({
    cmd: 'subscribe',
    topic: 'deck/+',
    messages: ret
  })

  function execute(msg) {
    var command = msg.topic.replace('deck/', '')
    if (deck[command])
      return deck[command]()
  }

  ret.on('data', execute)
}

var client = graft.pipe(ws.client({ port: 8001 }))

function build(deck) {
  client.on('ready', function() {
    console.log('connected!!');
    buildUpdater('sensortag/humidity', '#humidity')
    buildUpdater('sensortag/ir/object', '#ir-object')
    buildUpdater('sensortag/ir/ambient', '#ir-ambient')
    buildExecutor(deck)
  });
};

module.exports = function() {
  return build;
}
