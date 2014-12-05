var assert     = require('assert'),
    eventType  = require('../lib/eventType'),
    eventStore = require('../lib/eventStore');

describe('EventStore', function () {
    describe('#create()', function () {
        it('should emit event', function (done) {
            eventStore.once(eventType.featureCreated, function (x) {
                    assert(x);
                    done();
                }
            );

            var eventData = {
                'name': 'mail-server.validate-email-addresses',
                'enabled': false,
                'strategy': 'default',
                'description': 'Feature description'
            };

            eventStore.create({
                type: eventType.featureCreated,
                createdBy: 'ole',
                data: eventData
            });
        });
    });
});
