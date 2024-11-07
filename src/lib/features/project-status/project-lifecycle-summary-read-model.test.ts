import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_lifecycle_summary_read_model_serial', getLogger);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

describe('Average time calculation', () => {
    test('it calculates the average time for each stage', () => {});
    test("it ignores rows that don't have a next stage", () => {});
});
