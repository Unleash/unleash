// Partial types for "@unleash/express-openapi".
declare module '@unleash/express-openapi' {
    import type { RequestHandler } from 'express';

    export interface IExpressOpenApi extends RequestHandler {
        validPath: (operation: OpenAPIV3.OperationObject) => RequestHandler;
        schema: (name: string, schema: OpenAPIV3.SchemaObject) => void;
        swaggerui: RequestHandler;
    }

    export default function openapi(
        docsPath: string,
        document: Omit<OpenAPIV3.Document, 'paths'>,
        options?: { coerce: boolean; extendRefs: boolean },
    ): IExpressOpenApi;
}
