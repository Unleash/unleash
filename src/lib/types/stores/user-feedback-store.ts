import { Store } from './store';

export interface IUserFeedback {
    neverShow: boolean;
    feedbackId: string;
    given?: Date;
    userId: number;
}

export interface IUserFeedbackKey {
    userId: number;
    feedbackId: string;
}

export interface IUserFeedbackStore
    extends Store<IUserFeedback, IUserFeedbackKey> {
    getAllUserFeedback(userId: number): Promise<IUserFeedback[]>;
    getFeedback(userId: number, feedbackId: string): Promise<IUserFeedback>;
    updateFeedback(feedback: IUserFeedback): Promise<IUserFeedback>;
}
