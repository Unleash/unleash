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
    test("gives a NotFoundError with the ID of the segment if it doesn't exist", async () => {
        const id = 123;
        try {
            await segmentStore.get(id);
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
            expect(e.message).toEqual(expect.stringMatching(id.toString()));
        }
    });
});
