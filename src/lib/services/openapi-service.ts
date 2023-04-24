import openapi, { IExpressOpenApi } from '@unleash/express-openapi';
import { Express, RequestHandler, Response } from 'express';
import { IUnleashConfig } from '../types/option';
import {
    createOpenApiSchema,
    JsonSchemaProps,
    removeJsonSchemaProps,
    SchemaId,
} from '../openapi';
import { ApiOperation } from '../openapi/util/api-operation';
import { Logger } from '../logger';
import { validateSchema } from '../openapi/validate';
import { IFlagResolver } from '../types';
import { UnleashError } from '../error/api-error';

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
            { coerce: true, extendRefs: true },
        );
    }

    validPath(op: ApiOperation): RequestHandler {
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
                const errors = err.validationErrors.map((validationError) => {
                    const propertyName = validationError.dataPath.substring(
                        '.body.'.length,
                    );
                    if (validationError.keyword === 'required') {
                        const path =
                            propertyName +
                            '.' +
                            validationError.params.missingProperty;
                        return {
                            path,
                            description: `The ${path} property is required. It was not present on the data you sent.`,
                        };
                    } else {
                        const youSent = JSON.stringify(req.body[propertyName]);
                        return {
                            description: `The .${propertyName} property ${validationError.message}. You sent ${youSent}.`,
                            path: propertyName,
                        };
                    }
                });

                const apiError = new UnleashError({
                    name: 'ValidationError',
                    message:
                        "The request payload you provided doesn't conform to the schema. Check the `errors` property for a list of errors that we found.",
                    errors,
                });

                res.status(apiError.statusCode).json(apiError);
            } else {
                next(err);
            }
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
