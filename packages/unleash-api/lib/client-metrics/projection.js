'use strict';

module.exports = class Projection {
    constructor () {
        this.store = {};
    }

    getProjection () {
        return this.store;
    }

    add (name, countObj) {
        if (this.store[name]) {
            this.store[name].yes += countObj.yes;
            this.store[name].no += countObj.no;
        } else {
            this.store[name] = {
                yes: countObj.yes,
                no: countObj.no,
            };
        }
    }

    substract (name, countObj) {
        if (this.store[name]) {
            this.store[name].yes -= countObj.yes;
            this.store[name].no -= countObj.no;
        } else {
            this.store[name] = {
                yes: 0,
                no: 0,
            };
        }
    }
}
