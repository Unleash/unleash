'use strict';

const { Router } = require('express');
/**
 * Base class for Controllers to standardize binding to express Router.
 */
class Controller {
    constructor() {
        const router = Router();
        this.app = router;
    }

    get(path, handler) {
        this.app.get(path, handler.bind(this));
    }

    post(path, handler) {
        this.app.post(path, handler.bind(this));
    }

    put(path, handler) {
        this.app.put(path, handler.bind(this));
    }

    delete(path, handler) {
        this.app.delete(path, handler.bind(this));
    }

    router() {
        return this.app;
    }
}

module.exports = Controller;
