var s = null;
var LISTEN_PORT = 59810;
var extensionId = "kkfgkpcagopobkplodednkpcijlimcoo";

console.log("Play Music Remote App is active");

chrome.app.runtime.onLaunched.addListener(function() {
  // Tell your app what to launch and how.
});

remoteSockets = {};

// set up the socket
s = new MulticastSocket({ address: '239.255.255.250', port: LISTEN_PORT });
s.onReceive = function(e) {
  console.log(e);
  // send the message to the extension
  chrome.runtime.sendMessage(extensionId, decode(e.data), function(response) {
    if (response) {
      console.log('Recieved response from extension: ', response);
      sendToRemote(e.remoteAddress, e.remotePort, response);
    }
  });
};

s.connect(function() {});

chrome.runtime.onSuspend.addListener(function() {
  console.log("SUSPEND");
});

function decode(data) {
  var decoder = new TextDecoder('utf-8');

  return JSON.parse(decoder.decode(new DataView(data)));
}

function encode(data) {
  var encoder = new TextEncoder('utf-8');

  return encoder.encode(JSON.stringify(data)).buffer;
}

function sendToRemote(host, port, message) {
  chrome.sockets.udp.send(s.socketId, encode(message), host, port, function() {
    console.log(arguments);
  });
}
