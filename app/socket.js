/**
 *
 * @param {Object} config
 * @param {String} config.address
 * @param {Number} config.port
 * @constructor
 */
function RemoteSocket(config) {
  this.config = config;
}

RemoteSocket.prototype.onError = function (message) {};
RemoteSocket.prototype.onConnected = function () {};
RemoteSocket.prototype.onDiagram = function (arrayBuffer, remote_address, remote_port) {};
RemoteSocket.prototype.onDisconnected = function () {};

RemoteSocket.prototype.connect = function (callback) {
  var me = this;
  chrome.sockets.udp.create({bufferSize: 1024 * 1024}, function (createInfo) {
    var socketId = createInfo.socketId;
    var ttl = 12;
    chrome.sockets.udp.setMulticastTimeToLive(socketId, ttl, function (result) {
      if (result != 0) {
        me.handleError("Set TTL Error: ", "Unknown error");
      }
      chrome.sockets.udp.bind(socketId, "0.0.0.0", me.config.port, function (result) {
        if (result != 0) {
          chrome.sockets.udp.close(socketId, function () {
            me.handleError("Error on bind(): ", result);
          });
        } else {
          me.socketId = socketId;
          chrome.sockets.udp.onReceive.addListener(me.onReceive.bind(me));
          chrome.sockets.udp.onReceiveError.addListener(me.onReceiveError.bind(me));
          me.onConnected();
          if (callback) {
            callback.call(me);
          }
        }
      });
    });
  });
};

RemoteSocket.prototype.disconnect = function (callback) {
  var me = this;
  chrome.sockets.udp.onReceive.removeListener(me.onReceive.bind(me));
  chrome.sockets.udp.onReceiveError.removeListener(me.onReceiveError.bind(me));
  chrome.sockets.udp.close(me.socketId, function () {
    me.socketId = undefined;
    me.onDisconnected();
    if (callback) {
      callback.call(me);
    }
  });
};

RemoteSocket.prototype.handleError = function (additionalMessage, alternativeMessage) {
  var err = chrome.runtime.lastError;
  err = err && err.message || alternativeMessage;
  this.onError(additionalMessage + err);
};

RemoteSocket.prototype.onReceive = function (info) {
  try {
    this.onDiagram(info.data, info.remoteAddress, info.remotePort);
  } catch (error) {
    console.log(error);
  }
};

RemoteSocket.prototype.onReceiveError = function (socketId, resultCode) {
  this.handleError("", resultCode);
  this.disconnect();
};

RemoteSocket.prototype.arrayBufferToString = function (arrayBuffer) {
  // UTF-16LE
  return String.fromCharCode.apply(String, new Uint16Array(arrayBuffer));
};

RemoteSocket.prototype.stringToArrayBuffer = function (string) {
  var encoder = new TextEncoder('utf-8');

  return encoder.encode(string).buffer;
};

RemoteSocket.prototype.sendDiagram = function (message, callback, errCallback) {
  console.log("multicast send", message);

  if (typeof message === 'string') {
    message = this.stringToArrayBuffer(message);
  }

  if (!message || message.byteLength == 0 || !this.socketId) {
    if (callback) {
      callback.call(this);
    }
    return;
  }
  var me = this;
  chrome.sockets.udp.send(me.socketId, message, me.config.address, me.config.port,
      function (sendInfo) {
        console.log(sendInfo);
    if (sendInfo.resultCode >= 0 && sendInfo.bytesSent >= 0) {
      if (callback) {
        callback.call(me);
      }
    } else {
      if (errCallback) {
        errCallback();
      } else {
        me.handleError("");
        if (result.bytesSent == -15) {
          me.disconnect();
        }
      }
    }
  });
};
