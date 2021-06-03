import { Response } from 'express';

import Controller from '../controller';
import { Logger } from '../../logger';
import { IUserRequest } from './user';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import UserFeedbackService from '../../services/user-feedback-service';
import { handleErrors } from './util';

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
        req: IUserRequest<any, any, IFeedbackBody, any>,
        res: Response,
    ): Promise<void> {
        const { user } = req;

        const feedback = {
            ...req.body,
            userId: user.id,
            given: new Date(),
            neverShow: req.body.neverShow || false,
        };

        try {
            const updated = await this.userFeedbackService.updateFeedback(
                feedback,
            );
            res.json(updated);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    private async updateFeedbackSettings(
        req: IUserRequest<any, any, IFeedbackBody, any>,
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

        try {
            const updated = await this.userFeedbackService.updateFeedback(
                feedback,
            );
            res.json(updated);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}

module.exports = UserFeedbackController;
export default UserFeedbackController;
