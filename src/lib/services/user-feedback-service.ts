import { Logger } from '../logger';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import User from '../types/user';
import {
    IUserFeedback,
    IUserFeedbackStore,
} from '../types/stores/user-feedback-store';

export default class UserFeedbackService {
    private userFeedbackStore: IUserFeedbackStore;

    private logger: Logger;

    constructor(
        { userFeedbackStore }: Pick<IUnleashStores, 'userFeedbackStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.userFeedbackStore = userFeedbackStore;
        this.logger = getLogger('services/user-feedback-service.js');
    }

    async getAllUserFeedback(user: User): Promise<IUserFeedback[]> {
        if (user.isAPI) {
            return [];
        }
        try {
            return await this.userFeedbackStore.getAllUserFeedback(user.id);
        } catch (err) {
            this.logger.error(err);
            return [];
        }
    }

    async getFeedback(
        user_id: number,
        feedback_id: string,
    ): Promise<IUserFeedback> {
        return this.userFeedbackStore.getFeedback(user_id, feedback_id);
    }

    async updateFeedback(feedback: IUserFeedback): Promise<IUserFeedback> {
        return this.userFeedbackStore.updateFeedback(feedback);
    }
}

module.exports = UserFeedbackService;
