export enum PlaygroundFeatureSchemaVariantPayloadTypeEnum {
    Json = 'json',
    Csv = 'csv',
    String = 'string',
}

export interface PlaygroundFeatureSchemaVariantPayload {
    /**
     *
     * @type {string}
     * @memberof PlaygroundFeatureSchemaVariantPayload
     */
    type: PlaygroundFeatureSchemaVariantPayloadTypeEnum;
    /**
     *
     * @type {string}
     * @memberof PlaygroundFeatureSchemaVariantPayload
     */
    value: string;
}

export interface PlaygroundFeatureSchemaVariant {
    /**
     *
     * @type {string}
     * @memberof PlaygroundFeatureSchemaVariant
     */
    name: string;
    /**
     *
     * @type {boolean}
     * @memberof PlaygroundFeatureSchemaVariant
     */
    enabled: boolean;
    /**
     *
     * @type {PlaygroundFeatureSchemaVariantPayload}
     * @memberof PlaygroundFeatureSchemaVariant
     */
    payload?: PlaygroundFeatureSchemaVariantPayload;
}

export interface PlaygroundFeatureSchema {
    /**
     *
     * @type {string}
     * @memberof PlaygroundFeatureSchema
     */
    name: string;
    /**
     *
     * @type {string}
     * @memberof PlaygroundFeatureSchema
     */
    projectId: string;
    /**
     *
     * @type {boolean}
     * @memberof PlaygroundFeatureSchema
     */
    isEnabled: boolean;
    /**
     *
     * @type {PlaygroundFeatureSchemaVariant}
     * @memberof PlaygroundFeatureSchema
     */
    variant: PlaygroundFeatureSchemaVariant | null;
}
export interface PlaygroundResponseSchema {
    /**
     *
     * @type {PlaygroundRequestSchema}
     * @memberof PlaygroundResponseSchema
     */
    input: PlaygroundRequestSchema;
    /**
     *
     * @type {Array<PlaygroundFeatureSchema>}
     * @memberof PlaygroundResponseSchema
     */
    features: Array<PlaygroundFeatureSchema>;
}

export interface PlaygroundRequestSchema {
    /**
     *
     * @type {string}
     * @memberof PlaygroundRequestSchema
     */
    environment: string;
    /**
     *
     * @type {PlaygroundRequestSchemaProjects}
     * @memberof PlaygroundRequestSchema
     */
    projects?: Array<string> | string;
    /**
     *
     * @type {SdkContextSchema}
     * @memberof PlaygroundRequestSchema
     */
    context: SdkContextSchema;
}

export interface PlaygroundFeatureSchemaVariantPayload {
    /**
     *
     * @type {string}
     * @memberof PlaygroundFeatureSchemaVariantPayload
     */
    type: PlaygroundFeatureSchemaVariantPayloadTypeEnum;
    /**
     *
     * @type {string}
     * @memberof PlaygroundFeatureSchemaVariantPayload
     */
    value: string;
}

export interface PlaygroundFeatureSchemaVariant {
    /**
     *
     * @type {string}
     * @memberof PlaygroundFeatureSchemaVariant
     */
    name: string;
    /**
     *
     * @type {boolean}
     * @memberof PlaygroundFeatureSchemaVariant
     */
    enabled: boolean;
    /**
     *
     * @type {PlaygroundFeatureSchemaVariantPayload}
     * @memberof PlaygroundFeatureSchemaVariant
     */
    payload?: PlaygroundFeatureSchemaVariantPayload;
}

export interface PlaygroundFeatureSchema {
    /**
     *
     * @type {string}
     * @memberof PlaygroundFeatureSchema
     */
    name: string;
    /**
     *
     * @type {string}
     * @memberof PlaygroundFeatureSchema
     */
    projectId: string;
    /**
     *
     * @type {boolean}
     * @memberof PlaygroundFeatureSchema
     */
    isEnabled: boolean;
    /**
     *
     * @type {PlaygroundFeatureSchemaVariant}
     * @memberof PlaygroundFeatureSchema
     */
    variant: PlaygroundFeatureSchemaVariant | null;
}
export interface PlaygroundResponseSchema {
    /**
     *
     * @type {PlaygroundRequestSchema}
     * @memberof PlaygroundResponseSchema
     */
    input: PlaygroundRequestSchema;
    /**
     *
     * @type {Array<PlaygroundFeatureSchema>}
     * @memberof PlaygroundResponseSchema
     */
    features: Array<PlaygroundFeatureSchema>;
}

export interface PlaygroundRequestSchema {
    /**
     *
     * @type {string}
     * @memberof PlaygroundRequestSchema
     */
    environment: string;
    /**
     *
     * @type Array<string> | string
     * @memberof PlaygroundRequestSchema
     */
    projects?: Array<string> | string;
    /**
     *
     * @type {SdkContextSchema}
     * @memberof PlaygroundRequestSchema
     */
    context: SdkContextSchema;
}

export interface SdkContextSchema {
    [key: string]: string | any;
    /**
     *
     * @type {string}
     * @memberof SdkContextSchema
     */
    appName: string;
    /**
     *
     * @type {Date}
     * @memberof SdkContextSchema
     */
    currentTime?: Date;
    /**
     *
     * @type {string}
     * @memberof SdkContextSchema
     * @deprecated
     */
    environment?: string;
    /**
     *
     * @type {{ [key: string]: string; }}
     * @memberof SdkContextSchema
     */
    properties?: { [key: string]: string };
    /**
     *
     * @type {string}
     * @memberof SdkContextSchema
     */
    remoteAddress?: string;
    /**
     *
     * @type {string}
     * @memberof SdkContextSchema
     */
    sessionId?: string;
    /**
     *
     * @type {string}
     * @memberof SdkContextSchema
     */
    userId?: string;
}
