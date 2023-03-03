import joi from 'joi';
import { IMetricsBucket } from 'lib/types';

const countSchema = joi
    .object()
    .options({ stripUnknown: true })
    .keys({
        yes: joi.number().min(0).empty('').default(0),
        no: joi.number().min(0).empty('').default(0),
        variants: joi.object().pattern(joi.string(), joi.number().min(0)),
    });

// validated type from client-metrics-schema.ts with default values
export type ValidatedClientMetrics = {
    environment?: string;
    appName: string;
    instanceId: string;
    bucket: IMetricsBucket;
};

export const clientMetricsSchema = joi
    .object<ValidatedClientMetrics>()
    .options({ stripUnknown: true })
    .keys({
        environment: joi.string().optional(),
        appName: joi.string().required(),
        instanceId: joi.string().empty(['', null]).default('default'),
        bucket: joi
            .object()
            .required()
            .keys({
                start: joi.date().required(),
                stop: joi.date().required(),
                toggles: joi.object().pattern(/.*/, countSchema),
            }),
    });

export const clientMetricsEnvSchema = joi
    .object()
    .options({ stripUnknown: true })
    .keys({
        featureName: joi.string().required(),
        environment: joi.string().required(),
        appName: joi.string().required(),
        yes: joi.number().default(0),
        no: joi.number().default(0),
        timestamp: joi.date(),
        variants: joi.object().pattern(joi.string(), joi.number().min(0)),
    });
export const clientMetricsEnvBulkSchema = joi
    .array()
    .items(clientMetricsEnvSchema)
    .empty();

export const applicationSchema = joi
    .object()
    .options({ stripUnknown: false })
    .keys({
        appName: joi.string().required(),
        sdkVersion: joi.string().optional(),
        strategies: joi
            .array()
            .optional()
            .items(joi.string(), joi.any().strip()),
        description: joi.string().allow('').optional(),
        url: joi.string().allow('').optional(),
        color: joi.string().allow('').optional(),
        icon: joi.string().allow('').optional(),
        announced: joi.boolean().optional().default(false),
    });

export const batchMetricsSchema = joi
    .object()
    .options({ stripUnknown: true })
    .keys({
        applications: joi.array().items(applicationSchema),
        metrics: joi.array().items(clientMetricsEnvSchema),
    });

export const clientRegisterSchema = joi
    .object()
    .options({ stripUnknown: true })
    .keys({
        appName: joi.string().required(),
        instanceId: joi.string().empty(['', null]).default('default'),
        sdkVersion: joi.string().optional(),
        strategies: joi
            .array()
            .required()
            .items(joi.string(), joi.any().strip()),
        started: joi.date().required(),
        interval: joi.number().required(),
        environment: joi.string().optional(),
    });
