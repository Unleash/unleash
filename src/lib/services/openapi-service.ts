import openapi, { type IExpressOpenApi } from '@wesleytodd/openapi';
import {
    type Express,
    type RequestHandler,
    type Response,
    static as expressStatic,
} from 'express';
import type { IUnleashConfig } from '../types/option.js';
import {
    createOpenApiSchema,
    type JsonSchemaProps,
    removeJsonSchemaProps,
    type SchemaId,
} from '../openapi/index.js';
import type { ApiOperation } from '../openapi/util/api-operation.js';
import type { Logger } from '../logger.js';
import { validateSchema } from '../openapi/validate.js';
import type { IFlagResolver } from '../types/index.js';

export class OpenApiService {
    private readonly config: IUnleashConfig;

    private readonly logger: Logger;

    private readonly api: IExpressOpenApi;

    private flagResolver: IFlagResolver;

    constructor(config: IUnleashConfig) {
        this.config = config;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('openapi-service.ts');

        this.api = openapi(
            this.docsPath(),
            createOpenApiSchema(config.server),
            {
                coerce: true,
                extendRefs: true,
                basePath: config.server.baseUriPath,
            },
        );
    }

    validPath(op: ApiOperation): RequestHandler {
        const { beta, enterpriseOnly, ...rest } = op;

        const betaBadge = beta
            ? `![Beta](${this.docsStaticsPath()}/Beta.svg)
            
            `
            : '';
        const enterpriseBadge = enterpriseOnly
            ? `![Unleash Enterprise](${this.docsStaticsPath()}/Enterprise.svg) **Enterprise feature**
            
            `
            : '';
        return this.api.validPath({
            ...rest,
            description:
                `${enterpriseBadge}${betaBadge}${op.description}`.replaceAll(
                    /\n\s*/g,
                    '\n\n',
                ),
        });
    }

    useDocs(app: Express): void {
        app.use(this.api);
        app.use(this.docsPath(), this.api.swaggerui());
        app.use(
            this.docsStaticsPath(),
            expressStatic('openapi-static', { index: false }),
        );
    }

    docsStaticsPath(): string {
        const { baseUriPath = '' } = this.config.server ?? {};
        return `${baseUriPath}/docs/static`;
    }

    docsPath(): string {
        const { baseUriPath = '' } = this.config.server ?? {};
        return `${baseUriPath}/docs/openapi`;
    }

    registerCustomSchemas<T extends JsonSchemaProps>(
        schemas: Record<string, T>,
    ): void {
        Object.entries(schemas).forEach(([name, schema]) => {
            this.api.schema(name, removeJsonSchemaProps(schema));
        });
    }

    respondWithValidation<T, S = SchemaId>(
        status: number,
        res: Response<T>,
        schema: S,
        data: T,
        headers: { [header: string]: string } = {},
    ): void {
        const errors = validateSchema<S>(schema, data);

        if (errors) {
            this.logger.debug(
                'Invalid response:',
                JSON.stringify(errors, null, 4),
            );
            if (this.flagResolver.isEnabled('strictSchemaValidation')) {
                throw new Error(JSON.stringify(errors, null, 4));
            }
        }

        Object.entries(headers).forEach(([header, value]) =>
            res.header(header, value),
        );

        res.status(status).json(data);
    }
}
