import openapi from '@wesleytodd/openapi';
import { Express, RequestHandler } from 'express';
import { OpenAPIV3 } from 'openapi-types';
import { IUnleashConfig } from '../types/option';
import { createOpenApiSchema } from '../openapi';
import {
    AdminApiOperation,
    ClientApiOperation,
    ExpressOpenApi,
} from '../openapi/types';

export class OpenApiService {
    private readonly config: IUnleashConfig;

    private readonly api: ExpressOpenApi;

    constructor(config: IUnleashConfig) {
        this.config = config;
        this.api = openapi(
            this.docsPath(),
            createOpenApiSchema(config.server?.unleashUrl),
        );
    }

    // Create request validation middleware for an admin or client path.
    validPath(op: AdminApiOperation | ClientApiOperation): RequestHandler {
        return this.api.validPath(op);
    }

    // Serve the OpenAPI JSON at `${baseUriPath}/docs/openapi.json`,
    // and the OpenAPI SwaggerUI at `${baseUriPath}/docs/openapi`.
    useDocs(app: Express): void {
        app.use(this.api);
        app.use(this.docsPath(), this.api.swaggerui);
    }

    // The OpenAPI docs live at `<baseUriPath>/docs/openapi{,.json}`.
    docsPath(): string {
        const { baseUriPath = '' } = this.config.server ?? {};
        return `${baseUriPath}/docs/openapi`;
    }

    // Add custom schemas to the generated OpenAPI spec.
    // Used by unleash-enterprise to add its own schemas.
    registerCustomSchemas(schemas: {
        [name: string]: OpenAPIV3.SchemaObject;
    }): void {
        Object.entries(schemas).forEach(([name, schema]) => {
            this.api.schema(name, schema);
        });
    }

    // Catch and format Open API validation errors.
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
}
