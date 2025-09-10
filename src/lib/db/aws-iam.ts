import { Signer } from '@aws-sdk/rds-signer';
import {
    fromTemporaryCredentials,
    fromNodeProviderChain,
} from '@aws-sdk/credential-providers';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { ProxyAgent } from 'proxy-agent';
import type { IDBOption } from '../types/option.js';

type PasswordResolver = () => Promise<string>;

export const getDBPasswordResolver = (db: IDBOption): PasswordResolver => {
    if (!db.awsIamAuth) return async () => db.password;
    if (!db.awsRegion)
        throw new Error('AWS_REGION is required when DATABASE_AWS_IAM=true');

    const needProxy = Boolean(
        process.env.HTTPS_PROXY ||
            process.env.HTTP_PROXY ||
            process.env.NO_PROXY,
    );
    const proxyAgent = needProxy ? new ProxyAgent() : undefined;

    const requestHandler = needProxy
        ? new NodeHttpHandler({
              httpAgent: proxyAgent,
              httpsAgent: proxyAgent,
          })
        : undefined;

    const clientConfig = {
        region: db.awsRegion,
        endpoint: `https://sts.${db.awsRegion}.amazonaws.com`,
        requestHandler,
    };

    const baseCreds = fromNodeProviderChain({
        clientConfig,
    });

    const credentials = db.awsRoleArn
        ? fromTemporaryCredentials({
              params: {
                  RoleArn: db.awsRoleArn,
                  RoleSessionName: 'unleash-db-session',
              },
              clientConfig,
              masterCredentials: baseCreds,
          })
        : baseCreds;

    const signer = new Signer({
        region: db.awsRegion,
        hostname: db.host,
        port: db.port,
        username: db.user,
        credentials,
    });

    return async () => signer.getAuthToken();
};

export const getDBPassword = (db: IDBOption): Promise<string> =>
    getDBPasswordResolver(db)();
