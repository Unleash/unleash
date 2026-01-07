import joi from 'joi';
import { nameType } from '../routes/util.js';
import { tagTypeSchema } from '../services/tag-type-schema.js';
import { installationDefinitionSchema } from './installation-definition-schema.js';

export const addonDefinitionSchema = joi.object().keys({
    name: nameType,
    displayName: joi.string(),
    documentationUrl: joi.string().uri({ scheme: [/https?/] }),
    description: joi.string().allow(''),
    howTo: joi.string().optional().allow(''),
    deprecated: joi.string().optional().allow(''),
    parameters: joi
        .array()
        .optional()
        .items(
            joi.object().keys({
                name: joi.string().required(),
                displayName: joi.string().required(),
                type: joi.string().required(),
                description: joi.string(),
                placeholder: joi.string().allow(''),
                required: joi.boolean().default(false),
                sensitive: joi.boolean().default(false),
            }),
        ),
    events: joi.array().optional().items(joi.string()),
    tagTypes: joi.array().optional().items(tagTypeSchema),
    installation: installationDefinitionSchema.optional(),
    alerts: joi
        .array()
        .optional()
        .items(
            joi.object().keys({
                type: joi.string().valid('success', 'info', 'warning', 'error'),
                text: joi.string().required(),
            }),
        ),
});
