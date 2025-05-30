/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { LicensedUsersSchemaLicensedUsers } from './licensedUsersSchemaLicensedUsers.js';

/**
 * A response model representing user license data.
 */
export interface LicensedUsersSchema {
    /** An object containing historical and current licensed user data. */
    licensedUsers: LicensedUsersSchemaLicensedUsers;
    /**
     * The total number of licensed seats currently available for this Unleash instance.
     * @minimum 0
     */
    seatCount: number;
}
