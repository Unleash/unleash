import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { type IUser, RoleName, type IGroup } from '../../types';
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

let ownerRoleId: number;
let owner: IUser;
let member: IUser;
let group: IGroup;

beforeAll(async () => {
    db = await dbInit('project_owners_read_model_serial', getLogger);
    readModel = new ProjectOwnersReadModel(db.rawDatabase, db.stores.roleStore);
    ownerRoleId = (await db.stores.roleStore.getRoleByName(RoleName.OWNER)).id;

    const ownerData = {
        name: 'Owner User',
        username: 'owner',
        email: 'owner@email.com',
        imageUrl: 'image-url-1',
    };
    const memberData = {
        name: 'Member Name',
        username: 'member',
        email: 'member@email.com',
        imageUrl: 'image-url-2',
    };

    // create users
    owner = await db.stores.userStore.insert(ownerData);
    member = await db.stores.userStore.insert(memberData);

    // create groups
    group = await db.stores.groupStore.create({ name: 'Group Name' });
    await db.stores.groupStore.addUserToGroups(owner.id, [group.id]);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    if (db) {
        const projects = await db.stores.projectStore.getAll();
        for (const project of projects) {
            // Clean only project roles, not all roles
            await db.stores.roleStore.removeRolesForProject(project.id);
        }
        await db.stores.projectStore.deleteAll();
    }
});

describe('integration tests', () => {
    test('name takes precedence over username', async () => {
        const projectId = randomId();
        await db.stores.projectStore.create({ id: projectId, name: projectId });

        await db.stores.accessStore.addUserToRole(
            owner.id,
            ownerRoleId,
            projectId,
        );

        const owners = await readModel.getAllProjectOwners();
        expect(owners).toMatchObject({
            [projectId]: expect.arrayContaining([
                expect.objectContaining({ name: 'Owner User' }),
            ]),
        });
    });

    test('gets project user owners', async () => {
        const projectId = randomId();
        await db.stores.projectStore.create({ id: projectId, name: projectId });

        await db.stores.accessStore.addUserToRole(
            owner.id,
            ownerRoleId,
            projectId,
        );

        // fetch project owners
        const owners = await readModel.getAllProjectOwners();

        expect(owners).toMatchObject({
            [projectId]: [
                {
                    ownerType: 'user',
                    name: 'Owner User',
                    email: 'owner@email.com',
                    imageUrl: 'image-url-1',
                },
            ],
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
            ownerRoleId,
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
            [projectId]: [{ name: 'Owner User' }],
        });
    });

    test('gets project group owners', async () => {
        const projectId = randomId();
        await db.stores.projectStore.create({ id: projectId, name: projectId });

        await db.stores.accessStore.addGroupToRole(
            group.id,
            ownerRoleId,
            '',
            projectId,
        );

        // fetch project owners
        const owners = await readModel.getAllProjectOwners();

        expect(owners).toMatchObject({
            [projectId]: [
                {
                    ownerType: 'group',
                    name: 'Group Name',
                },
            ],
        });
    });

    test('users are listed before groups', async () => {});

    test('owners (users and groups) are sorted by when they were added; oldest first', async () => {});

    test('returns the system owner for the default project', async () => {});

    test('returns an empty list if there are no projects', async () => {
        const owners = await readModel.getAllProjectOwners();

        expect(owners).toStrictEqual({});
    });

    test('enriches fully', async () => {
        const owners = await readModel.enrichWithOwners([]);

        expect(owners).toStrictEqual([]);
    });
});
