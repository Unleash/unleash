var assert = require('assert');
var events = require('../lib/events');
var eventStore = require('../lib/eventStore');

describe('EventStore', function () {
    describe('#create()', function () {
        it('should emit event', function (done) {
            eventStore.on(events.featureCreated, function (x) {
                    assert(x);
                    done();
                }
            );
            eventStore.create({
                'name': 'mail-server.validate-email-addresses',
                'enabled': false,
                'strategy': 'default',
                'description': 'Feature description'
            });
        });
    });
});
