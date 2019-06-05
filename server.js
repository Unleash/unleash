'use strict';

const unleash = require('./lib/server-impl');

unleash
    .start()
    .then(instance => {
        const address = instance.server.address();
        console.log(
            `Unleash started on http://${address.address}:${address.port}`
        );
    })
    .catch(console.err);
