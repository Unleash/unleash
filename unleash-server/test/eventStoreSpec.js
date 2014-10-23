var assert = require('assert'),
    mockery = require('mockery'),
    eventType = require('../lib/eventType'),
    eventStore;


describe('EventStore', function () {
    before(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        mockery.registerSubstitute('./eventDb', '../test/eventDbMock');

        eventStore = require('../lib/eventStore');
    });

    after(function () {
        mockery.disable();
        mockery.deregisterAll();
    });

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
