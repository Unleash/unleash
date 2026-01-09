import openapi, { type IExpressOpenApi } from '@wesleytodd/openapi';
import generateDocument from '@wesleytodd/openapi/lib/generate-doc.js';
import type { Express, RequestHandler, Response } from 'express';
import type { IUnleashConfig } from '../types/option.js';
import {
    createOpenApiSchema,
    type JsonSchemaProps,
    removeJsonSchemaProps,
    type SchemaId,
} from '../openapi/index.js';
import {
    type ApiOperation,
    calculateStability,
} from '../openapi/util/api-operation.js';
import type { Logger } from '../logger.js';
import { validateSchema } from '../openapi/validate.js';
import type { IFlagResolver } from '../types/index.js';
import version from '../util/version.js';

const defaultReleaseVersion = '7.0.0';
export class OpenApiService {
    private readonly config: IUnleashConfig;

    private readonly logger: Logger;

    private readonly api: IExpressOpenApi;

    private readonly isDevelopment = process.env.NODE_ENV === 'development';

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
        const {
            beta,
            releaseVersion = defaultReleaseVersion,
            enterpriseOnly,
            ...rest
        } = op;
        const { baseUriPath = '' } = this.config.server ?? {};
        const openapiStaticAssets = `${baseUriPath}/openapi-static`;

        const stability = beta
            ? 'beta'
            : calculateStability(releaseVersion, version);
        const summaryWithStability =
            stability !== 'stable' && rest.summary
                ? `[${stability.toUpperCase()}] ${rest.summary}`
                : rest.summary;
        const stabilityBadge =
            stability !== 'stable'
                ? `**[${stability.toUpperCase()}]** This is a ${stability} endpoint and it may change or be removed in the future.
            `
                : '';
        const enterpriseBadge = enterpriseOnly
            ? `![Unleash Enterprise](${openapiStaticAssets}/Enterprise.svg) **Enterprise feature**

            `
            : '';

        const failDeprecated = (op.deprecated ?? false) && this.isDevelopment;

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
            summary: summaryWithStability,
            'x-stability-level': stability,
            ...(releaseVersion !== defaultReleaseVersion
                ? { 'x-release-version': releaseVersion }
                : {}),
            description:
                `${enterpriseBadge}${stabilityBadge}${op.description}`.replaceAll(
                    /\n\s*/g,
                    '\n\n',
                ),
        });
    }

    useDocs(app: Express): void {
        // Serve a filtered OpenAPI document that hides alpha endpoints from Swagger UI.
        app.get(`${this.docsPath()}.json`, (req, res, next) => {
            try {
                const doc = generateDocument(
                    (this.api as any).document,
                    req.app._router || req.app.router,
                    this.config.server.baseUriPath,
                );
                res.json(
                    this.isDevelopment ? doc : this.removeAlphaOperations(doc),
                );
            } catch (error) {
                next(error);
            }
        });

        app.use(this.api);
        app.use(this.docsPath(), this.api.swaggerui());
    }

    // Remove operations explicitly marked as alpha to keep them out of the rendered docs.
    // Paths with no remaining operations are dropped as well.
    private removeAlphaOperations(doc: any): any {
        if (!doc?.paths) {
            return doc;
        }

        const filteredPaths = Object.fromEntries(
            Object.entries(doc.paths)
                .map(([path, methods]) => {
                    const nonAlphaMethods = Object.fromEntries(
                        Object.entries(
                            methods as Record<string, unknown>,
                        ).filter(
                            ([, operation]) =>
                                (operation as any)?.['x-stability-level'] !==
                                'alpha',
                        ),
                    );
                    return [path, nonAlphaMethods];
                })
                .filter(([, methods]) => Object.keys(methods).length > 0),
        );

        return { ...doc, paths: filteredPaths };
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
