/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * A model representing a license response.
 */
export interface LicenseReadSchema {
    /** Name of the customer that owns the license. This is the name of the company that purchased the license. */
    customer?: string;
    /** Date when the license expires. */
    expireAt?: string;
    /** Identifier of the Unleash instance where this license is valid. */
    instanceId?: string;
    /** Name of the Unleash instance where this license is valid. */
    instanceName?: string;
    /** Date when the license was issued. */
    issuedAt?: string;
    /** Whether the license is valid or not. */
    isValid: boolean;
    /** Name of plan that the license is for. */
    plan?: string;
    /** Number of seats in the license. */
    seats?: number;
    /** The actual license token. */
    token?: string;
    /** Type of license. */
    type?: string;
}
