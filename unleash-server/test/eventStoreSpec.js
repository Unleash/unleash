var assert = require('assert');
var eventType = require('../lib/eventType');
var eventStore = require('../lib/eventStore');

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

            eventStore.create(eventType.featureCreated,"ole",eventData);
        });
    });
});
