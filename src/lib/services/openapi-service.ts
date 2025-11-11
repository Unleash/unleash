import type {
    RequestHandler,
    Response,
    Express,
    IRouter,
    ErrorRequestHandler,
} from 'express';
import swaggerUi from 'swagger-ui-express';
import { dump as dumpYaml } from 'js-yaml';
import { middleware as openApiValidator } from 'express-openapi-validator';
import type { OpenApiValidatorOpts } from 'express-openapi-validator/dist/openapi.validator.js';
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
import type { OpenAPIV3 } from 'openapi-types';
import { generateDocument } from '../openapi/generate-document.js';
import { setSchema } from '../openapi/layer-schema.js';

// Keep in sync with express-openapi-validator's non-string apiSpec shape.
type ImmutableOpenApiDocument = Exclude<
    OpenApiValidatorOpts['apiSpec'],
    string
>;

const deepFreeze = <T>(value: T): T => {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
        return value;
    }

    Reflect.ownKeys(value).forEach((key) => {
        const property = (value as Record<PropertyKey, unknown>)[key];
        if (
            property &&
            (typeof property === 'object' || typeof property === 'function')
        ) {
            deepFreeze(property);
        }
    });

    return Object.freeze(value);
};

const toImmutableDocument = (
    document: OpenAPIV3.Document,
): ImmutableOpenApiDocument => deepFreeze(document) as ImmutableOpenApiDocument;

export class OpenApiService {
    private readonly config: IUnleashConfig;

    private readonly logger: Logger;

    private readonly baseDocument: OpenAPIV3.Document;

    private document?: OpenAPIV3.Document;

    private validatorInstalled = false;

    private docsRegistered = false;

    private flagResolver: IFlagResolver;

    private validationErrorHandlerInstalled = false;

    constructor(config: IUnleashConfig) {
        this.config = config;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('openapi-service.ts');
        this.baseDocument = {
            ...createOpenApiSchema(config.server),
            paths: {},
        } as OpenAPIV3.Document;
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

        const middleware: RequestHandler = (req, res, next) => {
            if (failDeprecated) {
                this.logger.warn(
                    `Deprecated endpoint: ${op.operationId} at ${req.path}`,
                );
                return res.status(410).json({
                    message: `The endpoint ${op.operationId} at ${req.path} is deprecated and should not be used.`,
                });
            }
            return next();
        };

        setSchema(middleware, {
            ...rest,
            description:
                `${enterpriseBadge}${betaBadge}${op.description}`.replaceAll(
                    /\n\s*/g,
                    '\n\n',
                ),
        });

        return middleware;
    }

    async useDocs(app: Express, router: IRouter): Promise<void> {
        if (this.validatorInstalled || !this.config.enableOAS) {
            return;
        }
        await this.installValidator(router);
        if (!this.docsRegistered) {
            this.registerDocEndpoints(app, router);
            this.docsRegistered = true;
        }
    }

    docsPath(): string {
        const { baseUriPath = '' } = this.config.server ?? {};
        return `${baseUriPath}/docs/openapi`;
    }

    registerCustomSchemas<T extends JsonSchemaProps>(
        schemas: Record<string, T>,
    ): void {
        this.baseDocument.components = this.baseDocument.components || {
            schemas: {},
        };
        const target = this.baseDocument.components.schemas ?? {};

        Object.entries(schemas).forEach(([name, schema]) => {
            target[name] = removeJsonSchemaProps(schema);
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

        Object.entries(headers).forEach(([header, value]) =>
            res.header(header, value),
        );

        res.status(status).json(data);
    }

    private async installValidator(router: IRouter): Promise<void> {
        const document = toImmutableDocument(this.generate(router));
        const middleware = openApiValidator({
            apiSpec: document,
            validateRequests: {
                allowUnknownQueryParameters: true,
                coerceTypes: true,
            },
            validateResponses: false,
            validateSecurity: false,
            fileUploader: false,
            $refParser: { mode: 'bundle' },
            ignoreUndocumented: true,
        });

        const routerWithStack = router as unknown as { stack: any[] };
        router.use(...middleware);
        const insertedLayers = routerWithStack.stack.splice(
            -middleware.length,
            middleware.length,
        );
        if (insertedLayers.length) {
            routerWithStack.stack.unshift(...insertedLayers);
        }
        if (!this.validationErrorHandlerInstalled) {
            router.use(this.handleValidationError);
            this.validationErrorHandlerInstalled = true;
        }
        this.validatorInstalled = true;
    }

    private registerDocEndpoints(app: Express, router: IRouter): void {
        const jsonPath = `${this.docsPath()}.json`;
        const yamlPath = `${this.docsPath()}.yaml`;

        app.get(jsonPath, (_req, res) => {
            res.json(this.generate(router));
        });

        app.get([yamlPath, `${this.docsPath()}.yml`], (_req, res) => {
            res.type('yaml').send(
                dumpYaml(this.generate(router), {
                    skipInvalid: true,
                }),
            );
        });

        app.use(
            this.docsPath(),
            swaggerUi.serve,
            swaggerUi.setup(undefined, {
                swaggerOptions: {
                    url: jsonPath,
                },
            }),
        );
    }

    private generate(router: IRouter): OpenAPIV3.Document {
        this.document = generateDocument(
            this.baseDocument,
            router,
            this.config.server.baseUriPath,
        );
        return this.document;
    }

    private readonly handleValidationError: ErrorRequestHandler = (
        err,
        _req,
        res,
        next,
    ) => {
        const validationError = err as {
            status?: number;
            message?: string;
            errors?: unknown[];
        };
        if (validationError?.errors && validationError.status) {
            res.status(validationError.status).json({
                message: validationError.message ?? 'Validation failed',
                details: validationError.errors,
            });
            return;
        }
        next(err);
    };
}
