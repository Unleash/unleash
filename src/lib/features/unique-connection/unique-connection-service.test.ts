import { UniqueConnectionService } from './unique-connection-service';
import { FakeUniqueConnectionStore } from './fake-unique-connection-store';
import getLogger from '../../../test/fixtures/no-logger';
import type { IFlagResolver } from '../../types';
import { SDK_CONNECTION_ID_RECEIVED } from '../../metric-events';
import { addHours } from 'date-fns';
import EventEmitter from 'events';
import { UniqueConnectionReadModel } from './unique-connection-read-model';

const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
} as unknown as IFlagResolver;

test('sync first current bucket', async () => {
    const eventBus = new EventEmitter();
    const config = { flagResolver: alwaysOnFlagResolver, getLogger, eventBus };
    const uniqueConnectionStore = new FakeUniqueConnectionStore();
    const uniqueConnectionService = new UniqueConnectionService(
        { uniqueConnectionStore },
        config,
    );
    const uniqueConnectionReadModel = new UniqueConnectionReadModel(
        uniqueConnectionStore,
    );
    uniqueConnectionService.listen();

    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, 'connection1');
    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, 'connection1');
    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, 'connection2');
    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, 'connection2');
    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, 'connection2');

    await uniqueConnectionService.sync();

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({ previous: 0, current: 2 });
});

test('sync first previous bucket', async () => {
    const eventBus = new EventEmitter();
    const config = { flagResolver: alwaysOnFlagResolver, getLogger, eventBus };
    const uniqueConnectionStore = new FakeUniqueConnectionStore();
    const uniqueConnectionService = new UniqueConnectionService(
        { uniqueConnectionStore },
        config,
    );
    uniqueConnectionService.listen();
    const uniqueConnectionReadModel = new UniqueConnectionReadModel(
        uniqueConnectionStore,
    );

    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, 'connection1');
    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, 'connection2');

    await uniqueConnectionService.sync();

    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, 'connection3');

    await uniqueConnectionService.sync(addHours(new Date(), 1));

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({ previous: 3, current: 0 });
});

test('sync to existing current bucket from the same service', async () => {
    const eventBus = new EventEmitter();
    const config = { flagResolver: alwaysOnFlagResolver, getLogger, eventBus };
    const uniqueConnectionStore = new FakeUniqueConnectionStore();
    const uniqueConnectionService = new UniqueConnectionService(
        { uniqueConnectionStore },
        config,
    );
    uniqueConnectionService.listen();
    const uniqueConnectionReadModel = new UniqueConnectionReadModel(
        uniqueConnectionStore,
    );

    uniqueConnectionService.count('connection1');
    uniqueConnectionService.count('connection2');

    await uniqueConnectionService.sync();

    uniqueConnectionService.count('connection1');
    uniqueConnectionService.count('connection3');

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({ previous: 0, current: 3 });
});

test('sync to existing current bucket from another service', async () => {
    const eventBus = new EventEmitter();
    const config = {
        flagResolver: alwaysOnFlagResolver,
        getLogger,
        eventBus: eventBus,
    };
    const uniqueConnectionStore = new FakeUniqueConnectionStore();
    const uniqueConnectionService1 = new UniqueConnectionService(
        { uniqueConnectionStore },
        config,
    );
    const uniqueConnectionService2 = new UniqueConnectionService(
        { uniqueConnectionStore },
        config,
    );
    const uniqueConnectionReadModel = new UniqueConnectionReadModel(
        uniqueConnectionStore,
    );

    uniqueConnectionService1.count('connection1');
    uniqueConnectionService1.count('connection2');
    await uniqueConnectionService1.sync();

    uniqueConnectionService2.count('connection1');
    uniqueConnectionService2.count('connection3');
    await uniqueConnectionService2.sync();

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({ previous: 0, current: 3 });
});

test('sync to existing previous bucket from another service', async () => {
    const eventBus = new EventEmitter();
    const config = {
        flagResolver: alwaysOnFlagResolver,
        getLogger,
        eventBus: eventBus,
    };
    const uniqueConnectionStore = new FakeUniqueConnectionStore();
    const uniqueConnectionReadModel = new UniqueConnectionReadModel(
        uniqueConnectionStore,
    );
    const uniqueConnectionService1 = new UniqueConnectionService(
        { uniqueConnectionStore },
        config,
    );
    const uniqueConnectionService2 = new UniqueConnectionService(
        { uniqueConnectionStore },
        config,
    );

    uniqueConnectionService1.count('connection1');
    uniqueConnectionService1.count('connection2');
    await uniqueConnectionService1.sync(addHours(new Date(), 1));

    uniqueConnectionService2.count('connection1');
    uniqueConnectionService2.count('connection3');
    await uniqueConnectionService2.sync(addHours(new Date(), 1));

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({ previous: 3, current: 0 });
});

test('populate previous and current', async () => {
    const eventBus = new EventEmitter();
    const config = { flagResolver: alwaysOnFlagResolver, getLogger, eventBus };
    const uniqueConnectionStore = new FakeUniqueConnectionStore();
    const uniqueConnectionService = new UniqueConnectionService(
        { uniqueConnectionStore },
        config,
    );
    const uniqueConnectionReadModel = new UniqueConnectionReadModel(
        uniqueConnectionStore,
    );

    uniqueConnectionService.count('connection1');
    uniqueConnectionService.count('connection2');
    await uniqueConnectionService.sync();
    await uniqueConnectionService.sync();

    uniqueConnectionService.count('connection3');
    await uniqueConnectionService.sync(addHours(new Date(), 1));
    await uniqueConnectionService.sync(addHours(new Date(), 1)); // deliberate duplicate call

    uniqueConnectionService.count('connection3');
    uniqueConnectionService.count('connection4');
    await uniqueConnectionService.sync(addHours(new Date(), 1));
    await uniqueConnectionService.sync(addHours(new Date(), 1)); // deliberate duplicate call

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({ previous: 3, current: 2 });
});
