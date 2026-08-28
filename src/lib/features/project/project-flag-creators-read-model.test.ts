import EventEmitter from 'events';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type { ProjectAccess } from '../private-project/privateProjectStore.js';
import { ProjectFlagCreatorsReadModel } from './project-flag-creators-read-model.js';

let db: ITestDb;
let readModel: ProjectFlagCreatorsReadModel;

const insertCreatorWithFlag = async (
    email: string,
    project: string,
    flag: string,
): Promise<void> => {
    const user = await db.stores.userStore.insert({ email });
    await db.stores.projectStore.create({ id: project, name: project });
    await db.stores.featureToggleStore.create(project, {
        name: flag,
        createdByUserId: user.id,
    });
};

const insertCreator = async (email: string): Promise<number> => {
    const user = await db.stores.userStore.insert({ email });
    return user.id;
};

const insertFlag = async (
    userId: number,
    project: string,
    flag: string,
): Promise<void> => {
    await db.stores.featureToggleStore.create(project, {
        name: flag,
        createdByUserId: userId,
    });
};

beforeAll(async () => {
    db = await dbInit('project_flag_creators_read_model', getLogger);
    readModel = new ProjectFlagCreatorsReadModel(
        db.rawDatabase,
        new EventEmitter(),
    );
});

afterEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.userStore.deleteAll();
    await db.stores.projectStore.deleteAll();
});

afterAll(async () => {
    await db.destroy();
});

test('limited mode returns only creators of flags in the provided projects', async () => {
    await insertCreatorWithFlag('visible@x.io', 'visible-project', 'flag-1');
    await insertCreatorWithFlag('hidden@x.io', 'hidden-project', 'flag-2');

    const access: ProjectAccess = {
        mode: 'limited',
        projects: ['visible-project'],
    };
    const result = await readModel.getFlagCreatorsAcrossProjects(access, {
        limit: 50,
        offset: 0,
    });

    expect(result).toEqual({
        flagCreators: [{ id: expect.any(Number), name: 'visible@x.io' }],
        total: 1,
    });
});

test('excludes users with no name, username, or email from results and total', async () => {
    await db.stores.projectStore.create({ id: 'p1', name: 'p1' });
    const namedUser = await insertCreator('named@x.io');
    await insertFlag(namedUser, 'p1', 'flag-named');

    const ghostUserId = (
        await db.rawDatabase('users').insert({}).returning('id')
    )[0].id;
    await insertFlag(ghostUserId, 'p1', 'flag-ghost');

    const result = await readModel.getFlagCreatorsAcrossProjects(
        { mode: 'all' },
        { limit: 50, offset: 0 },
    );

    expect(result).toEqual({
        flagCreators: [{ id: namedUser, name: 'named@x.io' }],
        total: 1,
    });
});

test('matches name by substring but email and username only by prefix', async () => {
    await db.stores.projectStore.create({ id: 'p1', name: 'p1' });

    const nameSubstring = await db.stores.userStore.insert({
        name: 'John Smith',
        email: 'j@x.io',
    });
    await insertFlag(nameSubstring.id, 'p1', 'flag-name');

    const emailSuffix = await db.stores.userStore.insert({
        email: 'contact-smith@x.io',
    });
    await insertFlag(emailSuffix.id, 'p1', 'flag-email');

    const result = await readModel.getFlagCreatorsAcrossProjects(
        { mode: 'all' },
        { query: 'smith', limit: 50, offset: 0 },
    );

    expect(result).toEqual({
        flagCreators: [{ id: nameSubstring.id, name: 'John Smith' }],
        total: 1,
    });
});

test('paginates results and returns total across all matches', async () => {
    await db.stores.projectStore.create({ id: 'p1', name: 'p1' });
    const userA = await insertCreator('a@x.io');
    const userB = await insertCreator('b@x.io');
    const userC = await insertCreator('c@x.io');
    await insertFlag(userA, 'p1', 'flag-a');
    await insertFlag(userB, 'p1', 'flag-b');
    await insertFlag(userC, 'p1', 'flag-c');
    // a user without any flag should never appear
    await insertCreator('nobody@x.io');
    // a user with multiple flags should appear once
    await insertFlag(userA, 'p1', 'flag-a2');

    const access: ProjectAccess = { mode: 'all' };

    const page1 = await readModel.getFlagCreatorsAcrossProjects(access, {
        limit: 2,
        offset: 0,
    });
    expect(page1.total).toBe(3);
    expect(page1.flagCreators).toEqual([
        { id: userA, name: 'a@x.io' },
        { id: userB, name: 'b@x.io' },
    ]);

    const page2 = await readModel.getFlagCreatorsAcrossProjects(access, {
        limit: 2,
        offset: 2,
    });
    expect(page2.total).toBe(3);
    expect(page2.flagCreators).toEqual([{ id: userC, name: 'c@x.io' }]);
});
