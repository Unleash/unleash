import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { type IUser, RoleName, type IGroup } from '../../types/index.js';
import { randomId } from '../../util/index.js';
import { ProjectOwnersReadModel } from './project-owners-read-model.js';
import type { ProjectForUi } from './project-read-model-type.js';

const mockProjectData = (name: string): ProjectForUi => ({
    name,
    id: name,
    featureCount: 0,
    memberCount: 0,
    mode: 'open' as const,
    health: 100,
    technicalDebt: 0,
    createdAt: new Date(),
    favorite: false,
    lastReportedFlagUsage: null,
    lastUpdatedAt: null,
});

describe('unit tests', () => {
    test('maps owners to projects', () => {
        const projects = [
            { id: 'project1', name: 'Project one' },
            { id: 'project2', name: 'Project two' },
        ] as any;

        const owners = {
            project1: [{ ownerType: 'user' as const, name: 'Owner Name' }],
            project2: [{ ownerType: 'user' as const, name: 'Owner Name' }],
        };

        const projectsWithOwners = ProjectOwnersReadModel.addOwnerData(
            projects,
            owners,
        );

        expect(projectsWithOwners).toMatchObject([
            {
                id: 'project1',
                name: 'Project one',
                owners: [{ name: 'Owner Name' }],
            },
            {
                id: 'project2',
                name: 'Project two',
                owners: [{ name: 'Owner Name' }],
            },
        ]);
    });

    test('returns "system" when a project has no owners', async () => {
        const projects = [{ id: 'project1' }, { id: 'project2' }] as any;

        const owners = {};

        const projectsWithOwners = ProjectOwnersReadModel.addOwnerData(
            projects,
            owners,
        );

        expect(projectsWithOwners).toMatchObject([
            {
                id: 'project1',
                owners: [{ ownerType: 'system' }],
            },
            {
                id: 'project2',
                owners: [{ ownerType: 'system' }],
            },
        ]);
    });
});

let db: ITestDb;
let readModel: ProjectOwnersReadModel;

let ownerRoleId: number;
let owner: IUser;
let owner2: IUser;
let member: IUser;
let group: IGroup;
let group2: IGroup;

beforeAll(async () => {
    db = await dbInit('project_owners_read_model_serial', getLogger);
    readModel = new ProjectOwnersReadModel(db.rawDatabase);
    ownerRoleId = (await db.stores.roleStore.getRoleByName(RoleName.OWNER)).id;

    const ownerData = {
        name: 'Owner Name',
        username: 'owner',
        email: 'owner@email.com',
        imageUrl: 'image-url-1',
    };
    const ownerData2 = {
        name: 'Second Owner Name',
        username: 'owner2',
        email: 'owner2@email.com',
        imageUrl: 'image-url-3',
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
    owner2 = await db.stores.userStore.insert(ownerData2);

    // create groups
    group = await db.stores.groupStore.create({ name: 'Group Name' });
    await db.stores.groupStore.addUserToGroups(owner.id, [group.id]);
    group2 = await db.stores.groupStore.create({ name: 'Second Group Name' });
    await db.stores.groupStore.addUserToGroups(member.id, [group.id]);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    db.stores.roleStore;
});

describe('integration tests', () => {
    test('returns an empty object if there are no projects', async () => {
        const owners = await readModel.getProjectOwnersDictionary();

        expect(owners).toStrictEqual({});
    });

    test('name takes precedence over username', async () => {
        const projectId = randomId();
        await db.stores.projectStore.create({ id: projectId, name: projectId });

        await db.stores.accessStore.addUserToRole(
            owner.id,
            ownerRoleId,
            projectId,
        );

        const owners = await readModel.getProjectOwnersDictionary();
        expect(owners).toMatchObject({
            [projectId]: expect.arrayContaining([
                expect.objectContaining({ name: 'Owner Name' }),
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

        const owners = await readModel.getProjectOwnersDictionary();

        expect(owners).toMatchObject({
            [projectId]: [
                {
                    ownerType: 'user',
                    name: 'Owner Name',
                    email: 'owner@email.com',
                    imageUrl: expect.stringContaining(
                        'https://gravatar.com/avatar',
                    ),
                },
            ],
        });
    });

    test('does not get regular project members', async () => {
        const projectId = randomId();
        await db.stores.projectStore.create({ id: projectId, name: projectId });

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

        const owners = await readModel.getProjectOwnersDictionary();

        expect(owners).toMatchObject({
            [projectId]: [{ name: 'Owner Name' }],
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

        const owners = await readModel.getProjectOwnersDictionary();

        expect(owners).toMatchObject({
            [projectId]: [
                {
                    ownerType: 'group',
                    name: 'Group Name',
                },
            ],
        });
    });

    test('users are listed before groups', async () => {
        const projectId = randomId();
        await db.stores.projectStore.create({ id: projectId, name: projectId });

        await db.stores.accessStore.addGroupToRole(
            group.id,
            ownerRoleId,
            '',
            projectId,
        );

        await db.stores.accessStore.addUserToRole(
            owner.id,
            ownerRoleId,
            projectId,
        );

        const owners = await readModel.getProjectOwnersDictionary();

        expect(owners).toMatchObject({
            [projectId]: [
                {
                    email: 'owner@email.com',
                    imageUrl: expect.stringContaining(
                        'https://gravatar.com/avatar',
                    ),
                    name: 'Owner Name',
                    ownerType: 'user',
                },
                {
                    name: 'Group Name',
                    ownerType: 'group',
                },
            ],
        });
    });

    test('owners (users and groups) are sorted by when they were added; oldest first', async () => {
        const projectId = randomId();
        await db.stores.projectStore.create({ id: projectId, name: projectId });

        // Raw query in order to set the created_at date
        await db.rawDatabase('role_user').insert({
            user_id: owner2.id,
            role_id: ownerRoleId,
            project: projectId,
            created_at: new Date('2024-01-01T00:00:00.000Z'),
        });

        // Raw query in order to set the created_at date
        await db.rawDatabase('group_role').insert({
            group_id: group2.id,
            role_id: ownerRoleId,
            project: projectId,
            created_at: new Date('2024-01-01T00:00:00.000Z'),
        });

        await db.stores.accessStore.addGroupToRole(
            group.id,
            ownerRoleId,
            '',
            projectId,
        );

        await db.stores.accessStore.addUserToRole(
            owner.id,
            ownerRoleId,
            projectId,
        );

        const owners = await readModel.getProjectOwnersDictionary();

        expect(owners).toMatchObject({
            [projectId]: [
                {
                    email: 'owner2@email.com',
                    imageUrl: expect.stringContaining(
                        'https://gravatar.com/avatar',
                    ),
                    name: 'Second Owner Name',
                    ownerType: 'user',
                },
                {
                    email: 'owner@email.com',
                    imageUrl: expect.stringContaining(
                        'https://gravatar.com/avatar',
                    ),
                    name: 'Owner Name',
                    ownerType: 'user',
                },
                {
                    name: 'Second Group Name',
                    ownerType: 'group',
                },
                {
                    name: 'Group Name',
                    ownerType: 'group',
                },
            ],
        });
    });

    test('does not modify an empty array', async () => {
        const projectsWithOwners = await readModel.addOwners([]);

        expect(projectsWithOwners).toStrictEqual([]);
    });

    test('adds system owner when no owners are found', async () => {
        const projectIdA = randomId();
        const projectIdB = randomId();
        await db.stores.projectStore.create({
            id: projectIdA,
            name: projectIdA,
        });
        await db.stores.projectStore.create({
            id: projectIdB,
            name: projectIdB,
        });

        await db.stores.accessStore.addUserToRole(
            owner.id,
            ownerRoleId,
            projectIdB,
        );

        const projectsWithOwners = await readModel.addOwners([
            mockProjectData(projectIdA),
            mockProjectData(projectIdB),
        ]);

        expect(projectsWithOwners).toMatchObject([
            { name: projectIdA, owners: [{ ownerType: 'system' }] },
            { name: projectIdB, owners: [{ ownerType: 'user' }] },
        ]);
    });

    test('filters out system and group owners when getting all user project owners', async () => {
        const createProject = async () => {
            const id = randomId();
            return db.stores.projectStore.create({
                id,
                name: id,
            });
        };

        const projectA = await createProject();
        const projectB = await createProject();
        const projectC = await createProject();
        await createProject(); // <- no owner

        await db.stores.accessStore.addUserToRole(
            owner.id,
            ownerRoleId,
            projectA.id,
        );

        await db.stores.accessStore.addUserToRole(
            owner2.id,
            ownerRoleId,
            projectB.id,
        );

        await db.stores.accessStore.addGroupToRole(
            group.id,
            ownerRoleId,
            '',
            projectC.id,
        );

        const userOwners = await readModel.getAllUserProjectOwners();
        userOwners.sort((a, b) => a.name.localeCompare(b.name));

        expect(userOwners).toMatchObject([
            {
                name: owner.name,
                ownerType: 'user',
                email: owner.email,
                imageUrl: expect.stringContaining(
                    'https://gravatar.com/avatar',
                ),
            },
            {
                name: owner2.name,
                ownerType: 'user',
                email: owner2.email,
                imageUrl: expect.stringContaining(
                    'https://gravatar.com/avatar',
                ),
            },
        ]);
    });

    test('only returns projects listed in the projects input if provided', async () => {
        const createProject = async () => {
            const id = randomId();
            return db.stores.projectStore.create({
                id,
                name: id,
            });
        };

        const projectA = await createProject();
        const projectB = await createProject();

        await db.stores.accessStore.addUserToRole(
            owner.id,
            ownerRoleId,
            projectA.id,
        );

        await db.stores.accessStore.addUserToRole(
            owner2.id,
            ownerRoleId,
            projectB.id,
        );

        const noOwners = await readModel.getAllUserProjectOwners(new Set());
        expect(noOwners).toMatchObject([]);

        const onlyProjectA = await readModel.getAllUserProjectOwners(
            new Set([projectA.id]),
        );
        expect(onlyProjectA).toMatchObject([
            {
                name: owner.name,
                ownerType: 'user',
                email: owner.email,
                imageUrl: expect.stringContaining(
                    'https://gravatar.com/avatar',
                ),
            },
        ]);
    });
});
