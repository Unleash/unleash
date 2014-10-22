var assert = require('assert');
var events = require('../lib/events');
var EventRepository = require('../lib/eventRepository');
var eventRepository = new EventRepository();

describe('EventRepository', function () {
    describe('#create()', function () {
        it('should emit event', function (done) {
            eventRepository.on(events.featureCreated, function (x) {
                    assert(x);
                    done();
                }
            );
            eventRepository.create({
                'name': 'mail-server.validate-email-addresses',
                'enabled': false,
                'strategy': 'default',
                'description': 'Feature description'
            });
        });
    });
});
