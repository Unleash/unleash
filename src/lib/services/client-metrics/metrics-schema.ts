import joi from 'joi';
import { IAppInstance } from './index';

export interface IApplication {
    appName: string;
    sdkVersion?: string;
    strategies?: string[] | any[];
    description?: string;
    url?: string;
    color?: string;
    icon?: string;
    createdAt: Date;
    instances?: IAppInstance;
    seenToggles: Record<string, any>;
    links: Record<string, string>;
}

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
        description: joi
            .string()
            .allow('')
            .optional(),
        url: joi
            .string()
            .allow('')
            .optional(),
        color: joi
            .string()
            .allow('')
            .optional(),
        icon: joi
            .string()
            .allow('')
            .optional(),
    });
