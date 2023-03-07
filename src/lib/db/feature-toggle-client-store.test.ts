import getLogger from '../../test/fixtures/no-logger';
import dbInit from '../../test/e2e/helpers/database-init';
import FeatureToggleClientStore from './feature-toggle-client-store';
import EventEmitter from 'events';

test('Trying to get events if db fails should yield empty list', async () => {
    const db = await dbInit('feature_toggle_client_store', getLogger);
    const eventEmitter = new EventEmitter();
    const store = new FeatureToggleClientStore(
        db.rawDatabase,
        eventEmitter,
        getLogger,
    );
    const clientToggles = await store.getClient();
    expect(clientToggles.length).toBe(0);
});

// test('Trying to get events by name if db fails should yield empty list', async () => {
//     const db = knex({
//         client: 'pg',
//     });
//     const store = new EventStore(db, getLogger);
//     const events = await store.searchEvents({ type: 'application-created' });
//     expect(events).toBeTruthy();
//     expect(events.length).toBe(0);
// });
