import { IUser } from '.';
import { SYSTEM_USER } from './core';
import getLogger from '../../test/fixtures/no-logger';
import dbInit from '../../test/e2e/helpers/database-init';
import { setupAppWithCustomConfig } from '../../test/e2e/helpers/test-helper';

describe('variable definition matches db definition', () => {
    let dbDefinition: IUser;

    beforeAll(async () => {
        const db = await dbInit('core_test', getLogger);

        const app = await setupAppWithCustomConfig(
            db.stores,
            {
                experimental: {
                    flags: {
                        strictSchemaValidation: true,
                    },
                },
            },
            db.rawDatabase,
        );

        await app.services.userService.createUser({
            username: 'a',
            email: 'b@c.com',
            name: 'x',
            password: '2',
            rootRole: 2,
        });

        const x = await db.rawDatabase('users').select('*');
        // .where({ id: -1337 });
        console.log(
            'Got these users when using a raw query',
            await db.rawDatabase('users').select('*'),
        );

        await app.destroy();
        await db.destroy();
    });

    // afterAll(async () => {
    //     await db.destroy();
    // });

    test('All defined fields match', () => {
        expect(SYSTEM_USER).toMatchObject(dbDefinition);
    });

    test('Username matches', () => {
        expect(SYSTEM_USER.username).toBe(dbDefinition.username);
    });
    test('ID matches', () => {
        expect(SYSTEM_USER.id).toBe(dbDefinition.id);
    });
    test('Name matches', () => {
        expect(SYSTEM_USER.name).toBe(dbDefinition.name);
    });
    test('Email is empty', () => {
        expect(!('email' in SYSTEM_USER));
        expect(dbDefinition.email).toBeNull();
    });
});
