import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { RoleName } from '../../types';
import { randomId } from '../../util';
import { ProjectOwnersReadModel } from './project-owners-read-model';

describe('unit tests', () => {
    test('maps owners to projects', () => {});
});

let db: ITestDb;
let readModel: ProjectOwnersReadModel;

beforeAll(async () => {
    db = await dbInit('project_owners_read_model_serial', getLogger);
    readModel = new ProjectOwnersReadModel(db.rawDatabase);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    if (db) {
        await db.stores.projectStore.deleteAll();
    }
});

describe('integration tests', () => {
    test('name takes precedence over username', () => {
        // import { extractUsername } from '../../../util/extract-user';
    });

    test('gets project user owners', async () => {
        const projectId = randomId();

        const owner1create = {
            name: 'owner1',
            username: 'owner1',
            email: 'email1@email.com',
            imageUrl: 'image-url-1',
        };
        const owner2create = {
            name: 'owner2',
            username: 'owner2',
            email: 'email2@email.com',
            imageUrl: 'image-url-2',
        };

        // create users
        const owner1 = await db.stores.userStore.insert(owner1create);
        const owner2 = await db.stores.userStore.insert(owner2create);

        await db.stores.projectStore.create({ id: projectId, name: projectId });

        const ownerRole = await db.stores.roleStore.getRoleByName(
            RoleName.OWNER,
        );
        await db.stores.accessStore.addUserToRole(
            owner1.id,
            ownerRole.id,
            projectId,
        );
        await db.stores.accessStore.addUserToRole(
            owner2.id,
            ownerRole.id,
            projectId,
        );

        // fetch project owners
        const owners = await readModel.getAllProjectOwners();

        expect(owners).toMatchObject({
            [projectId]: [{ name: 'owner1' }, { name: 'owner2' }],
        });
    });
    test('does not get regular project members', () => {});
    test('gets project group owners', () => {});
    test('users are listed before groups', () => {});
    test('owners (users and groups) are sorted by when they were added; oldest first', () => {});
    test('returns the system owner for the default project', () => {});
    test('returns an empty list if there are no projects', async () => {
        const owners = await readModel.getAllProjectOwners();

        expect(owners).toStrictEqual({});
    });

    test('enriches fully', async () => {
        const owners = await readModel.enrichWithOwners([]);

        expect(owners).toStrictEqual([]);
    });
});
