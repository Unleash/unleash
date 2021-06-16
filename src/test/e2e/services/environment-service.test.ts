import EnvironmentService from '../../../lib/services/environment-service';
import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';
import NotFoundError from '../../../lib/error/notfound-error';

let stores;
let db;
let service: EnvironmentService;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('environment_service_serial', config.getLogger);
    stores = db.stores;
    service = new EnvironmentService(stores, config);
});

afterAll(async () => {
    await db.destroy();
});

test('Can create and get environment', async () => {
    const created = await service.create({
        name: 'testenv',
        displayName: 'Environment for testing',
    });

    const retrieved = await service.get('testenv');
    expect(retrieved).toEqual(created);
});

test('Can delete environment', async () => {
    await service.create({
        name: 'testenv',
        displayName: 'Environment for testing',
    });
    await service.delete('testenv');
    return expect(async () => service.get('testenv')).rejects.toThrow(
        NotFoundError,
    );
});

test('Can get all', async () => {
    await service.create({
        name: 'testenv',
        displayName: 'Environment for testing',
    });

    const environments = await service.getAll();
    expect(environments).toHaveLength(2); // the one we created plus ':global:'
});

test('Can update display name', async () => {
    await service.create({
        name: 'testenv',
        displayName: 'Environment for testing',
    });

    await service.update('testenv', { displayName: 'Different name' });
    const updated = await service.get('testenv');
    expect(updated.displayName).toEqual('Different name');
});
