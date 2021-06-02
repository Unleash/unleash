import { Response } from 'express';

import Controller from '../controller';
import { READ_ROLE } from '../../types/permissions';
import { Logger } from '../../logger';
import { IUserRequest } from './user';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import UserFeedbackService from '../../services/user-feedback-service';

interface IFeedbackBody {
    nevershow?: boolean;
    feedback_id: string;
    given?: Date;
}

class UserFeedbackController extends Controller {
    private logger: Logger;

    private userFeedbackService: UserFeedbackService;

    constructor(
        config: IUnleashConfig,
        { userFeedbackService }: Pick<IUnleashServices, 'userFeedbackService'>,
    ) {
        super(config);
        this.logger = config.getLogger('feedback-controller.ts');
        this.userFeedbackService = userFeedbackService;

        this.post('/', this.recordFeedback, READ_ROLE);
        this.get('/:id', this.getFeedback, READ_ROLE);
        this.put('/:id', this.updateFeedbackSettings, READ_ROLE);
    }

    private async recordFeedback(
        req: IUserRequest<any, any, IFeedbackBody, any>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        const feedback = {
            ...req.body,
            user_id: user.id,
            nevershow: req.body.nevershow || false,
        };

        const updated = await this.userFeedbackService.updateFeedback(feedback);
        res.json(updated);
    }

    private async getFeedback(
        req: IUserRequest<{ id: string }, any, IFeedbackBody, any>,
        res: Response,
    ): Promise<void> {
        const { id } = req.params;
        const { user } = req;

        const feedback = await this.userFeedbackService.getFeedback(
            user.id,
            id,
        );

        res.json(feedback);
    }

    private async updateFeedbackSettings(
        req: IUserRequest<any, any, IFeedbackBody, any>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        const { id } = req.params;

        const feedback = {
            ...req.body,
            feedback_id: id,
            user_id: user.id,
            nevershow: req.body.nevershow || false,
        };

        const updated = await this.userFeedbackService.updateFeedback(feedback);
        res.json(updated);
    }
}

module.exports = UserFeedbackController;
export default UserFeedbackController;
