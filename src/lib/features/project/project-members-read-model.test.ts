import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { type IUser, RoleName, type IGroup } from '../../types/index.js';
import { randomId } from '../../util/index.js';
import { ProjectMembersReadModel } from './project-members-read-model.js';

let db: ITestDb;
let readModel: ProjectMembersReadModel;

let memberRoleId: number;
let userA: IUser;
let userB: IUser;
let userC: IUser;
let userD: IUser;
let userE: IUser;
let group: IGroup;

beforeAll(async () => {
    db = await dbInit('project_members_read_model_serial', getLogger);
    readModel = new ProjectMembersReadModel(db.rawDatabase);
    memberRoleId = (await db.stores.roleStore.getRoleByName(RoleName.MEMBER))
        .id;

    userA = await db.stores.userStore.insert({
        name: 'User A',
        username: 'user-a',
        email: 'a@example.com',
    });
    userB = await db.stores.userStore.insert({
        name: 'User B',
        username: 'user-b',
        email: 'b@example.com',
    });
    userC = await db.stores.userStore.insert({
        name: 'User C',
        username: 'user-c',
        email: 'c@example.com',
    });
    userD = await db.stores.userStore.insert({
        name: 'User D',
        username: 'user-d',
        email: 'd@example.com',
    });
    userE = await db.stores.userStore.insert({
        name: 'User E',
        username: 'user-e',
        email: 'e@example.com',
    });

    group = await db.stores.groupStore.create({ name: 'Team' });
    await db.stores.groupStore.addUserToGroups(userD.id, [group.id]);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

test('returns empty object when no projects exist', async () => {
    const members = await readModel.getMembersPreviewByProject();
    expect(members).toStrictEqual({});
});

test('includes users with a direct project role', async () => {
    const projectId = randomId();
    await db.stores.projectStore.create({ id: projectId, name: projectId });
    await db.stores.accessStore.addUserToRole(
        userA.id,
        memberRoleId,
        projectId,
    );

    const members = await readModel.getMembersPreviewByProject();

    expect(members[projectId]).toMatchObject([
        {
            name: 'User A',
            email: 'a@example.com',
            imageUrl: expect.stringContaining('https://gravatar.com/avatar'),
        },
    ]);
});

test('includes users via a group with a project role', async () => {
    const projectId = randomId();
    await db.stores.projectStore.create({ id: projectId, name: projectId });
    await db.stores.accessStore.addGroupToRole(
        group.id,
        memberRoleId,
        '',
        projectId,
    );

    const members = await readModel.getMembersPreviewByProject();

    expect(members[projectId]).toMatchObject([{ name: 'User D' }]);
});

test('caps at 4 members per project', async () => {
    const projectId = randomId();
    await db.stores.projectStore.create({ id: projectId, name: projectId });

    for (const user of [userA, userB, userC, userD, userE]) {
        await db.stores.accessStore.addUserToRole(
            user.id,
            memberRoleId,
            projectId,
        );
    }

    const members = await readModel.getMembersPreviewByProject();

    expect(members[projectId]).toHaveLength(4);
});

test('deduplicates users present via both a direct role and a group', async () => {
    const projectId = randomId();
    await db.stores.projectStore.create({ id: projectId, name: projectId });

    // userD is both a direct member AND a member of the group with a project role
    await db.stores.accessStore.addUserToRole(
        userD.id,
        memberRoleId,
        projectId,
    );
    await db.stores.accessStore.addGroupToRole(
        group.id,
        memberRoleId,
        '',
        projectId,
    );

    const members = await readModel.getMembersPreviewByProject();

    expect(members[projectId]).toHaveLength(1);
    expect(members[projectId][0]).toMatchObject({ name: 'User D' });
});
