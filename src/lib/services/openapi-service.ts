import openapi, { type IExpressOpenApi } from '@wesleytodd/openapi';
import type { Express, RequestHandler, Response } from 'express';
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
        const { baseUriPath = '' } = this.config.server ?? {};
        const openapiStaticAssets = `${baseUriPath}/openapi-static`;
        const betaBadge = beta
            ? `![Beta](${openapiStaticAssets}/Beta.svg) This is a beta endpoint and it may change or be removed in the future.

            `
            : '';
        const enterpriseBadge = enterpriseOnly
            ? `![Unleash Enterprise](${openapiStaticAssets}/Enterprise.svg) **Enterprise feature**

            `
            : '';

        const failDeprecated =
            (op.deprecated ?? false) && process.env.NODE_ENV === 'development';

        if (failDeprecated) {
            return (req, res, _next) => {
                this.logger.warn(
                    `Deprecated endpoint: ${op.operationId} at ${req.path}`,
                );
                return res.status(410).json({
                    message: `The endpoint ${op.operationId} at ${req.path} is deprecated and should not be used.`,
                });
            };
        }
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
        schema: SchemaId,
        data: T,
        headers: { [header: string]: string } = {},
    ): void {
        const errors = validateSchema<S>(schema, data);

        if (errors) {
            this.logger.debug(
                `Invalid response for ${res.req?.originalUrl || ''}:`,
                errors,
            );
            if (this.flagResolver.isEnabled('strictSchemaValidation')) {
                throw new Error(JSON.stringify(errors, null, 4));
            }
        }

        Object.entries(headers).forEach(([header, value]) => {
            res.header(header, value);
        });

        res.status(status).json(data);
    }
}
