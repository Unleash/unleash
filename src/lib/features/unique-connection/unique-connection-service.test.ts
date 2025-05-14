import { UniqueConnectionService } from './unique-connection-service.js';
import { FakeUniqueConnectionStore } from './fake-unique-connection-store.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type { IFlagResolver } from '../../types/index.js';
import { SDK_CONNECTION_ID_RECEIVED } from '../../metric-events.js';
import { addHours } from 'date-fns';
import EventEmitter from 'events';
import { UniqueConnectionReadModel } from './unique-connection-read-model.js';

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

    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection1',
        type: 'backend',
    });
    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection1',
        type: 'backend',
    });
    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection2',
        type: 'backend',
    });
    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection2',
        type: 'backend',
    });
    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection2',
        type: 'backend',
    });

    await uniqueConnectionService.sync();

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 0,
        current: 2,
        previousBackend: 0,
        currentBackend: 2,
        previousFrontend: 0,
        currentFrontend: 0,
    });
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

    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection1',
        type: 'backend',
    });
    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection2',
        type: 'backend',
    });

    await uniqueConnectionService.sync();

    eventBus.emit(SDK_CONNECTION_ID_RECEIVED, {
        connectionId: 'connection3',
        type: 'backend',
    });

    await uniqueConnectionService.sync(addHours(new Date(), 1));

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 3,
        current: 0,
        previousBackend: 3,
        currentBackend: 0,
        previousFrontend: 0,
        currentFrontend: 0,
    });
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

    uniqueConnectionService.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection2',
        type: 'backend',
    });

    await uniqueConnectionService.sync();

    uniqueConnectionService.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection3',
        type: 'backend',
    });

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 0,
        current: 3,
        previousBackend: 0,
        currentBackend: 3,
        previousFrontend: 0,
        currentFrontend: 0,
    });
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

    uniqueConnectionService1.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService1.count({
        connectionId: 'connection2',
        type: 'backend',
    });
    await uniqueConnectionService1.sync();

    uniqueConnectionService2.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService2.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    await uniqueConnectionService2.sync();

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 0,
        current: 3,
        previousBackend: 0,
        currentBackend: 3,
        previousFrontend: 0,
        currentFrontend: 0,
    });
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

    uniqueConnectionService1.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService1.count({
        connectionId: 'connection2',
        type: 'backend',
    });
    await uniqueConnectionService1.sync(addHours(new Date(), 1));

    uniqueConnectionService2.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService2.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    await uniqueConnectionService2.sync(addHours(new Date(), 1));

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 3,
        current: 0,
        previousBackend: 3,
        currentBackend: 0,
        previousFrontend: 0,
        currentFrontend: 0,
    });
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

    uniqueConnectionService.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection2',
        type: 'backend',
    });
    await uniqueConnectionService.sync();
    await uniqueConnectionService.sync();

    uniqueConnectionService.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    await uniqueConnectionService.sync(addHours(new Date(), 1));
    await uniqueConnectionService.sync(addHours(new Date(), 1)); // deliberate duplicate call

    uniqueConnectionService.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection4',
        type: 'backend',
    });
    await uniqueConnectionService.sync(addHours(new Date(), 1));
    await uniqueConnectionService.sync(addHours(new Date(), 1)); // deliberate duplicate call

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 3,
        current: 2,
        previousBackend: 3,
        currentBackend: 2,
        previousFrontend: 0,
        currentFrontend: 0,
    });
});

test('populate all buckets', async () => {
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

    uniqueConnectionService.count({
        connectionId: 'connection1',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection2',
        type: 'frontend',
    });
    await uniqueConnectionService.sync();
    await uniqueConnectionService.sync();

    uniqueConnectionService.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    await uniqueConnectionService.sync(addHours(new Date(), 1));
    await uniqueConnectionService.sync(addHours(new Date(), 1)); // deliberate duplicate call

    uniqueConnectionService.count({
        connectionId: 'connection3',
        type: 'backend',
    });
    uniqueConnectionService.count({
        connectionId: 'connection4',
        type: 'frontend',
    });
    await uniqueConnectionService.sync(addHours(new Date(), 1));
    await uniqueConnectionService.sync(addHours(new Date(), 1)); // deliberate duplicate call

    const stats = await uniqueConnectionReadModel.getStats();
    expect(stats).toEqual({
        previous: 3,
        current: 2,
        previousBackend: 2,
        currentBackend: 1,
        previousFrontend: 1,
        currentFrontend: 1,
    });
});
