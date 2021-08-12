import { Response } from 'express';

import Controller from '../controller';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import UserFeedbackService from '../../services/user-feedback-service';
import { IAuthRequest } from '../unleash-types';

interface IFeedbackBody {
    neverShow?: boolean;
    feedbackId: string;
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

        this.post('/', this.recordFeedback);
        this.put('/:id', this.updateFeedbackSettings);
    }

    private async recordFeedback(
        req: IAuthRequest<any, any, IFeedbackBody, any>,
        res: Response,
    ): Promise<void> {
        const BAD_REQUEST = 400;
        const { user } = req;

        const { feedbackId } = req.body;

        if (!feedbackId) {
            res.status(BAD_REQUEST).json({
                error: 'feedbackId must be present.',
            });
            return;
        }

        const feedback = {
            ...req.body,
            userId: user.id,
            given: new Date(),
            neverShow: req.body.neverShow || false,
        };

        const updated = await this.userFeedbackService.updateFeedback(feedback);
        res.json(updated);
    }

    private async updateFeedbackSettings(
        req: IAuthRequest<any, any, IFeedbackBody, any>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        const { id } = req.params;

        const feedback = {
            ...req.body,
            feedbackId: id,
            userId: user.id,
            neverShow: req.body.neverShow || false,
        };

        const updated = await this.userFeedbackService.updateFeedback(feedback);
        res.json(updated);
    }
}

module.exports = UserFeedbackController;
export default UserFeedbackController;
