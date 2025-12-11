import NotImplementedError from '../../lib/error/not-implemented-error.js';
import type {
    IUserFeedback,
    IUserFeedbackKey,
    IUserFeedbackStore,
} from '../../lib/types/stores/user-feedback-store.js';

export default class FakeUserFeedbackStore implements IUserFeedbackStore {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete(_key: IUserFeedbackKey): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exists(_key: IUserFeedbackKey): Promise<boolean> {
        return Promise.resolve(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(_key: IUserFeedbackKey): Promise<IUserFeedback> {
        throw new NotImplementedError('This is not implemented yet');
    }

    getAll(): Promise<IUserFeedback[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAllUserFeedback(_userId: number): Promise<IUserFeedback[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getFeedback(_userId: number, _feedbackId: string): Promise<IUserFeedback> {
        throw new NotImplementedError('This is not implemented yet');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateFeedback(_feedback: IUserFeedback): Promise<IUserFeedback> {
        throw new NotImplementedError('This is not implemented yet');
    }
}
