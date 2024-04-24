import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
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

describe('integration tests', () => {
    test('gets project owners', () => {});
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
