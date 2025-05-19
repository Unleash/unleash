import dbInit, { type ITestDb } from '../../test/e2e/helpers/database-init.js';
import { SYSTEM_USER } from './core.js';
import getLogger from '../../test/fixtures/no-logger.js';

describe('System user definitions in code and db', () => {
    let dbDefinition: {
        email: string | null;
        username: string;
        name: string;
        id: number;
        image_url: string | null;
    };
    let db: ITestDb;
    beforeAll(async () => {
        db = await dbInit('system_user_alignment_test', getLogger);

        const query = await db.rawDatabase.raw(
            `select * from users where id = -1337;`,
        );

        dbDefinition = query.rows[0];
    });

    afterAll(async () => {
        await db.destroy();
    });
    test('usernames match', () => {
        expect(SYSTEM_USER.username).toBe(dbDefinition.username);
    });
    test('ids match', () => {
        expect(SYSTEM_USER.id).toBe(dbDefinition.id);
    });
    test('names match', () => {
        expect(SYSTEM_USER.name).toBe(dbDefinition.name);
    });
    test('emails match', () => {
        expect('email' in SYSTEM_USER).toBe(false);
        expect(dbDefinition.email).toBe(null);
    });
    test('image URLs are both falsy', () => {
        expect(Boolean(SYSTEM_USER.imageUrl)).toBe(
            Boolean(dbDefinition.image_url),
        );
    });
    test('isApi is false on variable definition', () => {
        // we don't set this in the DB, so let's just test the
        // definition
        expect(SYSTEM_USER.isAPI).toBe(false);
    });
});
