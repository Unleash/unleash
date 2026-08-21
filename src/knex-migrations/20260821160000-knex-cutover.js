/**
 * This no-op migration is the boundary between the immutable db-migrate
 * history and all new Knex migrations.
 */
/** @param {import('knex').Knex} _knex */
export const up = async (_knex) => {};

/** @param {import('knex').Knex} _knex */
export const down = async (_knex) => {};
