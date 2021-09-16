import { IUserFeedbackStore } from 'lib/types/stores/user-feedback-store';
import { IUserStore } from 'lib/types/stores/user-store';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';

let stores;
let db;
let userFeedbackStore: IUserFeedbackStore;
let userStore: IUserStore;
let currentUser;

beforeAll(async () => {
    db = await dbInit('user_feedback_store', getLogger);
    stores = db.stores;
    userFeedbackStore = stores.userFeedbackStore;
    userStore = stores.userStore;
    currentUser = await userStore.upsert({ email: 'me.feedback@mail.com' });
});

afterAll(async () => {
    await db.destroy();
});

afterEach(async () => {
    await userFeedbackStore.deleteAll();
});

test('should create userFeedback', async () => {
    await userFeedbackStore.updateFeedback({
        feedbackId: 'some-id',
        userId: currentUser.id,
        neverShow: false,
        given: new Date(),
    });
    const userFeedbacks = await userFeedbackStore.getAllUserFeedback(
        currentUser.id,
    );
    expect(userFeedbacks).toHaveLength(1);
    expect(userFeedbacks[0].feedbackId).toBe('some-id');
});

test('should get userFeedback', async () => {
    await userFeedbackStore.updateFeedback({
        feedbackId: 'some-id',
        userId: currentUser.id,
        neverShow: false,
        given: new Date(),
    });
    const userFeedback = await userFeedbackStore.getFeedback(
        currentUser.id,
        'some-id',
    );
    expect(userFeedback.feedbackId).toBe('some-id');
});

test('should exists', async () => {
    await userFeedbackStore.updateFeedback({
        feedbackId: 'some-id-3',
        userId: currentUser.id,
        neverShow: false,
        given: new Date(),
    });
    const exists = await userFeedbackStore.exists({
        userId: currentUser.id,
        feedbackId: 'some-id-3',
    });
    expect(exists).toBe(true);
});

test('should not exists', async () => {
    const exists = await userFeedbackStore.exists({
        userId: currentUser.id,
        feedbackId: 'some-id-not-here',
    });
    expect(exists).toBe(false);
});

test('should get all userFeedbacks', async () => {
    await userFeedbackStore.updateFeedback({
        feedbackId: 'some-id-2',
        userId: currentUser.id,
        neverShow: false,
        given: new Date(),
    });
    const userFeedbacks = await userFeedbackStore.getAll();
    expect(userFeedbacks).toHaveLength(1);
    expect(userFeedbacks[0].feedbackId).toBe('some-id-2');
});
