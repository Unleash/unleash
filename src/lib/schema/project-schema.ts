import joi from 'joi';

export const addEnvironment = joi
    .object()
    .keys({ environment: joi.string().required() })
    .options({ stripUnknown: true, allowUnknown: false, abortEarly: false });
