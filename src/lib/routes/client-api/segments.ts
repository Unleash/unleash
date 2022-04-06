import { Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types';
import { Logger } from '../../logger';
import { SegmentService } from '../../services/segment-service';
import { IAuthRequest } from '../unleash-types';

export class SegmentsController extends Controller {
    private logger: Logger;

    private segmentService: SegmentService;

    constructor(
        { segmentService }: Pick<IUnleashServices, 'segmentService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        this.logger = config.getLogger('/client-api/segments.ts');
        this.segmentService = segmentService;

        this.get('/active', this.getActive);
    }

    async getActive(req: IAuthRequest, res: Response): Promise<void> {
        const segments = await this.segmentService.getActive();
        res.json({ segments });
    }
}
