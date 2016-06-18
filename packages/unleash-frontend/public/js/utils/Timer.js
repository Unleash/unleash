'use strict';
const Timer = function(cb, interval) {
    this.cb = cb;
    this.interval = interval;
    this.timerId = null;
};

Timer.prototype.start = function() {
    if (this.timerId != null) {
        console.warn('timer already started'); // eslint-disable-line no-console
    }

    console.log('starting timer'); // eslint-disable-line no-console
    this.timerId = setInterval(this.cb, this.interval);
    this.cb();
};

Timer.prototype.stop  = function() {
    if (this.timerId == null) {
        console.warn('no timer running'); // eslint-disable-line no-console
    } else {
        console.log('stopping timer'); // eslint-disable-line no-console
        clearInterval(this.timerId);
        this.timerId = null;
    }
};

module.exports = Timer;
