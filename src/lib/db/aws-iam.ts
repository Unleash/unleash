import { Signer } from '@aws-sdk/rds-signer';
import type { IDBOption } from '../types/option.js';

type PasswordResolver = () => Promise<string>;

export const getDBPasswordResolver = (db: IDBOption): PasswordResolver => {
    if (db.awsIamAuth) {
        if (!db.awsRegion)
            throw new Error(
                'AWS_REGION is required when DATABASE_AWS_IAM=true',
            );

        const signer = new Signer({
            region: db.awsRegion,
            hostname: db.host,
            port: db.port,
            username: process.env.DATABASE_USERNAME || db.user,
        });
        return async () => {
            console.log('[AWS RDS SIGNER] Getting token...');
            const token = await signer.getAuthToken();
            console.log(`[AWS RDS SIGNER] Got token: ${token}`);
            return token;
        };
    }

    return async () => db.password;
};

export const getDBPassword = (db: IDBOption): Promise<string> =>
    getDBPasswordResolver(db)();
