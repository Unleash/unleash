import type { Logger } from '../logger.js';
import type { IUnleashStores } from '../types/stores.js';
import type { IUnleashConfig } from '../types/option.js';
import type { IUser } from '../types/user.js';
import type {
    IUserFeedback,
    IUserFeedbackStore,
} from '../types/stores/user-feedback-store.js';

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

    async getAllUserFeedback(user: IUser): Promise<IUserFeedback[]> {
        if (user.isAPI) {
            return [];
        }
        try {
            return await this.userFeedbackStore.getAllUserFeedback(user.id);
        } catch (err) {
            this.logger.error('Cannot read user feedback', err);
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
