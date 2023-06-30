import { BadDataError } from '../error';
import { ISegmentStore } from '../types/stores/segment-store';
import dbInit from '../../test/e2e/helpers/database-init';
import getLogger from '../../test/fixtures/no-logger';
import NotFoundError from '../error/notfound-error';

let stores;
let db;
let segmentStore: ISegmentStore;

beforeAll(async () => {
    db = await dbInit('segment_store_serial', getLogger);
    stores = db.stores;
    segmentStore = stores.segmentStore;
});

afterAll(async () => {
    await db.destroy();
});

describe('unexpected input handling for get segment', () => {
    test('gives bad data error if the id is a floating point number', async () => {
        const id = 42.5;
        try {
            await segmentStore.get(id);
        } catch (e) {
            expect(e instanceof BadDataError).toBeTruthy();
            expect(e.message).toEqual(expect.stringMatching(id.toString()));
        }
    });
    test("gives bad data error if the id is a value greater than Postgres's max integer", async () => {
        const id = 123456789456;
        try {
            await segmentStore.get(id);
        } catch (e) {
            expect(e instanceof BadDataError).toBeTruthy();
            expect(e.message).toEqual(expect.stringMatching(id.toString()));
        }
    });
    test("gives a NotFoundError with the ID of the segment if it doesn't exist", async () => {
        const id = 123;
        try {
            await segmentStore.get(id);
        } catch (e) {
            console.log(e.message);
            expect(e instanceof NotFoundError).toBeTruthy();
            expect(e.message).toEqual(expect.stringMatching(id.toString()));
        }
    });
});
