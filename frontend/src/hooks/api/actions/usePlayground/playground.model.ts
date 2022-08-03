import { VariantSchema } from '../../../../openapi';

export const PlaygroundConstraintSchemaOperatorEnum = {
    NotIn: 'NOT_IN',
    In: 'IN',
    StrEndsWith: 'STR_ENDS_WITH',
    StrStartsWith: 'STR_STARTS_WITH',
    StrContains: 'STR_CONTAINS',
    NumEq: 'NUM_EQ',
    NumGt: 'NUM_GT',
    NumGte: 'NUM_GTE',
    NumLt: 'NUM_LT',
    NumLte: 'NUM_LTE',
    DateAfter: 'DATE_AFTER',
    DateBefore: 'DATE_BEFORE',
    SemverEq: 'SEMVER_EQ',
    SemverGt: 'SEMVER_GT',
    SemverLt: 'SEMVER_LT',
} as const;
export type PlaygroundConstraintSchemaOperatorEnum =
    typeof PlaygroundConstraintSchemaOperatorEnum[keyof typeof PlaygroundConstraintSchemaOperatorEnum];

export interface PlaygroundConstraintSchema {
    /**
     * The name of the context field that this constraint should apply to.
     * @type {string}
     * @memberof PlaygroundConstraintSchema
     */
    contextName: string;
    /**
     * The operator to use when evaluating this constraint. For more information about the various operators, refer to [the strategy constraint operator documentation](https://docs.getunleash.io/advanced/strategy_constraints#strategy-constraint-operators).
     * @type {string}
     * @memberof PlaygroundConstraintSchema
     */
    operator: PlaygroundConstraintSchemaOperatorEnum;
    /**
     * Whether the operator should be case sensitive or not. Defaults to `false` (being case sensitive).
     * @type {boolean}
     * @memberof PlaygroundConstraintSchema
     */
    caseInsensitive?: boolean;
    /**
     * Whether the result should be negated or not. If `true`, will turn a `true` result into a `false` result and vice versa.
     * @type {boolean}
     * @memberof PlaygroundConstraintSchema
     */
    inverted?: boolean;
    /**
     * The context values that should be used for constraint evaluation. Use this property instead of `value` for properties that accept multiple values.
     * @type {Array<string>}
     * @memberof PlaygroundConstraintSchema
     */
    values?: Array<string>;
    /**
     * The context value that should be used for constraint evaluation. Use this property instead of `values` for properties that only accept single values.
     * @type {string}
     * @memberof PlaygroundConstraintSchema
     */
    value?: string;
    /**
     * Whether this was evaluated as true or false.
     * @type {boolean}
     * @memberof PlaygroundConstraintSchema
     */
    result: boolean;
}

export interface PlaygroundFeatureSchema {
    /**
     * The feature's name.
     * @type {string}
     * @memberof PlaygroundFeatureSchema
     */
    name: string;
    /**
     * The ID of the project that contains this feature.
     * @type {string}
     * @memberof PlaygroundFeatureSchema
     */
    projectId: string;
    /**
     * The strategies that apply to this feature.
     * @type {Array<PlaygroundStrategySchema>}
     * @memberof PlaygroundFeatureSchema
     */
    strategies: Array<PlaygroundStrategySchema>;
    /**
     * Whether the feature is active and would be evaluated in the provided environment in a normal SDK context.
     * @type {boolean}
     * @memberof PlaygroundFeatureSchema
     */
    isEnabledInCurrentEnvironment: boolean;
    /**
     *
     * @type {PlaygroundFeatureSchemaIsEnabled}
     * @memberof PlaygroundFeatureSchema
     */
    isEnabled: boolean | 'unevaluated';
    /**
     *
     * @type {PlaygroundFeatureSchemaVariant}
     * @memberof PlaygroundFeatureSchema
     */
    variant: PlaygroundFeatureSchemaVariant | null;
    /**
     *
     * @type {Array<VariantSchema>}
     * @memberof PlaygroundFeatureSchema
     */
    variants: Array<VariantSchema>;
}

export interface PlaygroundFeatureSchemaVariant {
    /**
     * The variant's name. If there is no variant or if the toggle is disabled, this will be `disabled`
     * @type {string}
     * @memberof PlaygroundFeatureSchemaVariant
     */
    name: string;
    /**
     * Whether the variant is enabled or not. If the feature is disabled or if it doesn't have variants, this property will be `false`
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

export interface PlaygroundFeatureSchemaVariantPayload {
    /**
     * The format of the payload.
     * @type {string}
     * @memberof PlaygroundFeatureSchemaVariantPayload
     */
    type: PlaygroundFeatureSchemaVariantPayloadTypeEnum;
    /**
     * The payload value stringified.
     * @type {string}
     * @memberof PlaygroundFeatureSchemaVariantPayload
     */
    value: string;
}

export const PlaygroundFeatureSchemaVariantPayloadTypeEnum = {
    Json: 'json',
    Csv: 'csv',
    String: 'string',
} as const;
export type PlaygroundFeatureSchemaVariantPayloadTypeEnum =
    typeof PlaygroundFeatureSchemaVariantPayloadTypeEnum[keyof typeof PlaygroundFeatureSchemaVariantPayloadTypeEnum];

export interface PlaygroundRequestSchema {
    /**
     * The environment to evaluate toggles in.
     * @type {string}
     * @memberof PlaygroundRequestSchema
     */
    environment: string;
    /**
     *
     * @type {PlaygroundRequestSchemaProjects}
     * @memberof PlaygroundRequestSchema
     */
    projects?: PlaygroundRequestSchemaProjects;
    /**
     *
     * @type {SdkContextSchema}
     * @memberof PlaygroundRequestSchema
     */
    context: SdkContextSchema;
}

export type PlaygroundRequestSchemaProjects = Array<string> | string;

export interface PlaygroundResponseSchema {
    /**
     *
     * @type {PlaygroundRequestSchema}
     * @memberof PlaygroundResponseSchema
     */
    input: PlaygroundRequestSchema;
    /**
     * The list of features that have been evaluated.
     * @type {Array<PlaygroundFeatureSchema>}
     * @memberof PlaygroundResponseSchema
     */
    features: Array<PlaygroundFeatureSchema>;
}

export interface PlaygroundSegmentSchema {
    /**
     * The segment's id.
     * @type {number}
     * @memberof PlaygroundSegmentSchema
     */
    id: number;
    /**
     * The name of the segment.
     * @type {string}
     * @memberof PlaygroundSegmentSchema
     */
    name: string;
    /**
     * Whether this was evaluated as true or false.
     * @type {boolean}
     * @memberof PlaygroundSegmentSchema
     */
    result: boolean;
    /**
     * The list of constraints in this segment.
     * @type {Array<PlaygroundConstraintSchema>}
     * @memberof PlaygroundSegmentSchema
     */
    constraints: Array<PlaygroundConstraintSchema>;
}

export interface PlaygroundStrategySchema {
    /**
     * The strategy's name.
     * @type {string}
     * @memberof PlaygroundStrategySchema
     */
    name: string;
    /**
     * The strategy's id.
     * @type {string}
     * @memberof PlaygroundStrategySchema
     */
    id?: string;
    /**
     *
     * @type {PlaygroundStrategySchemaResult}
     * @memberof PlaygroundStrategySchema
     */
    result: PlaygroundStrategySchemaResult;
    /**
     * The strategy's segments and their evaluation results.
     * @type {Array<PlaygroundSegmentSchema>}
     * @memberof PlaygroundStrategySchema
     */
    segments: Array<PlaygroundSegmentSchema>;
    /**
     * The strategy's constraints and their evaluation results.
     * @type {Array<PlaygroundConstraintSchema>}
     * @memberof PlaygroundStrategySchema
     */
    constraints: Array<PlaygroundConstraintSchema>;
    /**
     *
     * @type {{ [key: string]: string; }}
     * @memberof PlaygroundStrategySchema
     */
    parameters: { [key: string]: string };
}

export const PlaygroundStrategySchemaResultEvaluationStatusEnum = {
    Complete: 'complete',
} as const;
export type PlaygroundStrategySchemaResultEvaluationStatusEnum =
    typeof PlaygroundStrategySchemaResultEvaluationStatusEnum[keyof typeof PlaygroundStrategySchemaResultEvaluationStatusEnum];

export interface PlaygroundStrategySchemaResult {
    /**
     * Signals that this strategy was evaluated successfully.
     * @type {string}
     * @memberof PlaygroundStrategySchemaResult
     */
    evaluationStatus?: PlaygroundStrategySchemaResultEvaluationStatusEnum;
    /**
     * Whether this strategy evaluates to true or not.
     * @type {boolean}
     * @memberof PlaygroundStrategySchemaResult
     */
    enabled: boolean;
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
