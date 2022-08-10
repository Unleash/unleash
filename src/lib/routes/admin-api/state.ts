import * as mime from 'mime';
import YAML from 'js-yaml';
import multer from 'multer';
import { format as formatDate } from 'date-fns';
import { Request, Response } from 'express';
import Controller from '../controller';
import { ADMIN } from '../../types/permissions';
import { extractUsername } from '../../util/extract-user';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import StateService from '../../services/state-service';
import { IAuthRequest } from '../unleash-types';
import { OpenApiService } from '../../services/openapi-service';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import {
    exportQueryParameters,
    ExportQueryParameters,
} from '../../openapi/spec/export-query-parameters';
import { emptyResponse } from '../../openapi/util/standard-responses';
import { OpenAPIV3 } from 'openapi-types';

const upload = multer({ limits: { fileSize: 5242880 } });
const paramToBool = (param, def) => {
    if (param === null || param === undefined) {
        return def;
    }
    const nu = Number.parseInt(param, 10);
    if (Number.isNaN(nu)) {
        return param.toLowerCase() === 'true';
    }
    return Boolean(nu);
};
class StateController extends Controller {
    private logger: Logger;

    private stateService: StateService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            stateService,
            openApiService,
        }: Pick<IUnleashServices, 'stateService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/state.ts');
        this.stateService = stateService;
        this.openApiService = openApiService;
        this.fileupload('/import', upload.single('file'), this.import, ADMIN);
        this.route({
            method: 'post',
            path: '/import',
            permission: ADMIN,
            handler: this.import,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Import/Export'],
                    operationId: 'import',
                    responses: {
                        202: emptyResponse,
                    },
                    requestBody: createRequestSchema('stateSchema'),
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/export',
            permission: ADMIN,
            handler: this.export,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Import/Export'],
                    operationId: 'export',
                    responses: {
                        200: createResponseSchema('stateSchema'),
                    },
                    parameters:
                        exportQueryParameters as unknown as OpenAPIV3.ParameterObject[],
                }),
            ],
        });
    }

    async import(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        const { drop, keep } = req.query;
        // TODO: Should override request type so file is a type on request
        let data;
        // @ts-expect-error
        if (req.file) {
            // @ts-expect-error
            if (mime.getType(req.file.originalname) === 'text/yaml') {
                // @ts-expect-error
                data = YAML.load(req.file.buffer);
            } else {
                // @ts-expect-error
                data = JSON.parse(req.file.buffer);
            }
        } else {
            data = req.body;
        }

        await this.stateService.import({
            data,
            userName,
            dropBeforeImport: paramToBool(drop, false),
            keepExisting: paramToBool(keep, true),
        });
        res.sendStatus(202);
    }

    async export(
        req: Request<unknown, unknown, unknown, ExportQueryParameters>,
        res: Response,
    ): Promise<void> {
        const { format } = req.query;

        const downloadFile = paramToBool(req.query.download, false);
        const includeStrategies = paramToBool(req.query.strategies, true);
        const includeFeatureToggles = paramToBool(
            req.query.featureToggles,
            true,
        );
        const includeProjects = paramToBool(req.query.projects, true);
        const includeTags = paramToBool(req.query.tags, true);
        const includeEnvironments = paramToBool(req.query.environments, true);

        const data = await this.stateService.export({
            includeStrategies,
            includeFeatureToggles,
            includeProjects,
            includeTags,
            includeEnvironments,
        });
        const timestamp = formatDate(Date.now(), 'yyyy-MM-dd_HH-mm-ss');
        if (format === 'yaml') {
            if (downloadFile) {
                res.attachment(`export-${timestamp}.yml`);
            }
            res.type('yaml').send(YAML.dump(data, { skipInvalid: true }));
        } else {
            if (downloadFile) {
                res.attachment(`export-${timestamp}.json`);
            }
            res.json(data);
        }
    }
}
export default StateController;
