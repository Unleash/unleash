import openapi, { IExpressOpenApi } from '@unleash/express-openapi';
import { Express, RequestHandler, Response } from 'express';
import { IUnleashConfig } from '../types/option';
import {
    AdminApiOperation,
    ClientApiOperation,
    createOpenApiSchema,
    JsonSchemaProps,
    removeJsonSchemaProps,
    SchemaId,
} from '../openapi';
import { Logger } from '../logger';
import { validateSchema } from '../openapi/validate';

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

    registerCustomSchemas<T extends JsonSchemaProps>(
        schemas: Record<string, T>,
    ): void {
        Object.entries(schemas).forEach(([name, schema]) => {
            this.api.schema(name, removeJsonSchemaProps(schema));
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
        schema: SchemaId,
        data: T,
    ): void {
        const errors = validateSchema(schema, data);

        if (errors) {
            if (process.env.NODE_ENV === 'development') {
                throw new Error(JSON.stringify(errors, null, 2));
            } else {
                this.logger.warn('Invalid response:', errors);
            }
        }

        res.status(status).json(data);
    }
}
