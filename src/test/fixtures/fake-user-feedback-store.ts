import NotImplementedError from '../../lib/error/not-implemented-error.js';
import type {
    IUserFeedback,
    IUserFeedbackKey,
    IUserFeedbackStore,
} from '../../lib/types/stores/user-feedback-store.js';

export default class FakeUserFeedbackStore implements IUserFeedbackStore {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete(key: IUserFeedbackKey): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exists(key: IUserFeedbackKey): Promise<boolean> {
        return Promise.resolve(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(key: IUserFeedbackKey): Promise<IUserFeedback> {
        throw new NotImplementedError('This is not implemented yet');
    }

    getAll(): Promise<IUserFeedback[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAllUserFeedback(userId: number): Promise<IUserFeedback[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getFeedback(userId: number, feedbackId: string): Promise<IUserFeedback> {
        throw new NotImplementedError('This is not implemented yet');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateFeedback(feedback: IUserFeedback): Promise<IUserFeedback> {
        throw new NotImplementedError('This is not implemented yet');
    }
}
