import openapi, { IExpressOpenApi } from '@unleash/express-openapi';
import { Express, RequestHandler, Response } from 'express';
import { OpenAPIV3 } from 'openapi-types';
import { IUnleashConfig } from '../types/option';
import { createOpenApiSchema } from '../openapi';
import { AdminApiOperation, ClientApiOperation } from '../openapi/operation';
import { validateJsonSchema } from '../openapi/validate';
import { Logger } from '../logger';

export class OpenApiService {
    private readonly config: IUnleashConfig;

    private readonly logger: Logger;

    private readonly api: IExpressOpenApi;

    constructor(config: IUnleashConfig) {
        this.config = config;
        this.logger = config.getLogger('openapi-service.ts');

        this.api = openapi(
            this.docsPath(),
            createOpenApiSchema(config.server?.unleashUrl),
            { coerce: true },
        );
    }

    validPath(op: AdminApiOperation | ClientApiOperation): RequestHandler {
        return this.api.validPath(op);
    }

    useDocs(app: Express): void {
        app.use(this.api);
        app.use(this.docsPath(), this.api.swaggerui);
    }

    docsPath(): string {
        const { baseUriPath = '' } = this.config.server ?? {};
        return `${baseUriPath}/docs/openapi`;
    }

    registerCustomSchemas(schemas: {
        [name: string]: OpenAPIV3.SchemaObject;
    }): void {
        Object.entries(schemas).forEach(([name, schema]) => {
            this.api.schema(name, schema);
        });
    }

    useErrorHandler(app: Express): void {
        app.use((err, req, res, next) => {
            if (err && err.status && err.validationErrors) {
                res.status(err.status).json({
                    error: err.message,
                    validation: err.validationErrors,
                });
            } else {
                next();
            }
        });
    }

    respondWithValidation<T>(
        status: number,
        res: Response<T>,
        schema: OpenAPIV3.SchemaObject,
        data: T,
    ): void {
        const errors = validateJsonSchema(schema, data);

        if (errors) {
            this.logger.warn('Invalid response:', errors);
        }

        res.status(status).json(data);
    }
}
