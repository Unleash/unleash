import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { type IUser, RoleName } from '../../types';
import { randomId } from '../../util';
import { ProjectOwnersReadModel } from './project-owners-read-model';

describe('unit tests', () => {
    test('maps owners to projects', () => {});
    test('returns "system" when a project has no owners', async () => {
        // this is a mapping test; not an integration test
    });
});

let db: ITestDb;
let readModel: ProjectOwnersReadModel;

let owner: IUser;
let member: IUser;

beforeAll(async () => {
    db = await dbInit('project_owners_read_model_serial', getLogger);
    readModel = new ProjectOwnersReadModel(db.rawDatabase, db.stores.roleStore);

    const ownerData = {
        name: 'owner',
        username: 'owner',
        email: 'owner@email.com',
        imageUrl: 'image-url-1',
    };
    const memberData = {
        name: 'member',
        username: 'member',
        email: 'member@email.com',
        imageUrl: 'image-url-2',
    };

    // create users
    owner = await db.stores.userStore.insert(ownerData);
    member = await db.stores.userStore.insert(memberData);
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

        await db.stores.projectStore.create({ id: projectId, name: projectId });

        const ownerRole = await db.stores.roleStore.getRoleByName(
            RoleName.OWNER,
        );
        await db.stores.accessStore.addUserToRole(
            owner.id,
            ownerRole.id,
            projectId,
        );

        // fetch project owners
        const owners = await readModel.getAllProjectOwners();

        expect(owners).toMatchObject({
            [projectId]: [{ name: 'owner' }],
        });
    });

    test('does not get regular project members', async () => {
        const projectId = randomId();

        await db.stores.projectStore.create({ id: projectId, name: projectId });

        const ownerRole = await db.stores.roleStore.getRoleByName(
            RoleName.OWNER,
        );

        const memberRole = await db.stores.roleStore.getRoleByName(
            RoleName.MEMBER,
        );
        await db.stores.accessStore.addUserToRole(
            owner.id,
            ownerRole.id,
            projectId,
        );

        await db.stores.accessStore.addUserToRole(
            member.id,
            memberRole.id,
            projectId,
        );

        // fetch project owners
        const owners = await readModel.getAllProjectOwners();

        expect(owners).toMatchObject({
            [projectId]: [{ name: 'owner' }],
        });
    });

    test('gets project group owners', async () => {});
    test('users are listed before groups', async () => {});
    test('owners (users and groups) are sorted by when they were added; oldest first', async () => {});
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
