function KeyboardInputManager() {
  this.events = {};

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
    this.bindButtonPress(".start-ai-fast-button", this.startAIFast);
    this.bindButtonPress(".start-ai-deep-button", this.startAIDeep);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
    document.getElementById("ai-container").style.visibility = 'visible';
    document.getElementById("ai-container").style.display = 'block';
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.startAIFast = function (event) {
    event.preventDefault();
    document.getElementById("ai-container").style.visibility = 'hidden';
    document.getElementById("ai-container").style.display = 'none';
    this.emit("startAIFast");
};

KeyboardInputManager.prototype.startAIDeep = function (event) {
    event.preventDefault();
    document.getElementById("ai-container").style.visibility = 'hidden';
    document.getElementById("ai-container").style.display = 'none';
    this.emit("startAIDeep");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};
