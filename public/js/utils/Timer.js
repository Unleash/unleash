var Timer = function(cb, interval) {
    this.cb = cb;
    this.interval = interval;
    this.timerId = null;
};

Timer.prototype.start = function() {
    if (this.timerId != null) {
        console.warn("timer already started");
    }

    console.log('starting timer');
    this.timerId = setInterval(this.cb, this.interval);
    this.cb();
};

Timer.prototype.stop  = function() {
    if (this.timerId == null) {
        console.warn('no timer running');
    } else {
        console.log('stopping timer');
        clearInterval(this.timerId);
        this.timerId = null;
    }
};

module.exports = Timer;