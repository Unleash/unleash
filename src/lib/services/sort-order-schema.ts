import joi from 'joi';

export const sortOrderSchema = joi.object().pattern(/^/, joi.number());
