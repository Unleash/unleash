/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * A user is either an actual User or a Service Account
 */
export type CreateUserResponseSchemaAccountType =
    (typeof CreateUserResponseSchemaAccountType)[keyof typeof CreateUserResponseSchemaAccountType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateUserResponseSchemaAccountType = {
    User: 'User',
    Service_Account: 'Service Account',
} as const;
