import { generateKeyPair, privateDecrypt } from 'node:crypto';
import { promisify } from 'node:util';
import type {
    IAuditUser,
    IFlagResolver,
    IUnleashConfig,
} from '../types/index.js';
import type AddonService from '../services/addon-service.js';
import NotFoundError from '../error/notfound-error.js';
import { randomId } from '../util/random-id.js';
import slackAppDefinition from './slack-app-definition.js';

export class SlackAppInstallError extends Error {}

export type SlackAppCallbackBody = {
    state?: string;
    sealed_connection?: string;
    error?: string;
};

type SlackAppSealedConnection = {
    accessToken: string;
    team: { name: string };
};

export interface ISlackAppPendingConnection {
    id: string;
    projectId?: string;
    parameters: Record<string, unknown>;
    privateKey: string;
    expiresAt: number;
}

export class SlackAppInstallService {
    private addonService: Pick<AddonService, 'createAddon'>;

    private flagResolver: IFlagResolver;

    private unleashUrl: string;

    private brokerUrl: string;

    private now: () => number;

    constructor(
        {
            addonService,
        }: { addonService: SlackAppInstallService['addonService'] },
        {
            flagResolver,
            server,
        }: Pick<IUnleashConfig, 'flagResolver' | 'server'>,
        now: () => number,
    ) {
        this.addonService = addonService;
        this.flagResolver = flagResolver;
        this.unleashUrl = server.unleashUrl;
        this.brokerUrl = server.slackAppBrokerUrl;
        this.now = now;
    }

    async startInstall(
        parameters: Record<string, unknown>,
        projectId?: string,
        unleashUrl = this.unleashUrl,
    ): Promise<{ connectUrl: string; connection: ISlackAppPendingConnection }> {
        if (!this.flagResolver.isEnabled('slackAppAuthV2')) {
            throw new NotFoundError('Not found');
        }

        const { publicKey, privateKey } = await this.createKeyPair();
        const connection: ISlackAppPendingConnection = {
            id: randomId(),
            projectId,
            parameters,
            privateKey,
            expiresAt: this.now() + 60 * 60 * 1000, // 1 hour
        };

        const params = new URLSearchParams({
            return_to: unleashUrl,
            public_key: publicKey.toString('base64url'),
            state: connection.id,
        });

        return {
            connectUrl: `${this.brokerUrl}/connect?${params}`,
            connection,
        };
    }

    verifyConnection(
        connection: ISlackAppPendingConnection | undefined,
        state: unknown,
    ): ISlackAppPendingConnection {
        if (!this.flagResolver.isEnabled('slackAppAuthV2')) {
            throw new NotFoundError('Not found');
        }

        if (
            !connection ||
            connection.id !== state ||
            connection.expiresAt < this.now()
        ) {
            throw new SlackAppInstallError(
                'Unleash could not find this Slack connection. Please try to connect again.',
            );
        }

        return connection;
    }

    async completeInstall(
        { parameters, projectId, privateKey }: ISlackAppPendingConnection,
        { sealed_connection: sealedConnection, error }: SlackAppCallbackBody,
        auditUser: IAuditUser,
    ): Promise<number> {
        if (!sealedConnection) {
            throw new SlackAppInstallError(
                `Slack did not connect (${error ?? 'no token returned'}). Please try to connect again.`,
            );
        }

        const { accessToken, team } = this.openSealed(
            sealedConnection,
            privateKey,
        );

        const { id } = await this.addonService.createAddon(
            {
                provider: slackAppDefinition.name,
                enabled: true,
                description: `Slack workspace ${team.name}`,
                parameters: { ...parameters, accessToken },
                events: [],
            },
            auditUser,
            projectId,
        );

        return id;
    }

    private async createKeyPair(): Promise<{
        publicKey: Buffer;
        privateKey: string;
    }> {
        return await promisify(generateKeyPair)('rsa', {
            modulusLength: 3072,
            publicKeyEncoding: { type: 'spki', format: 'der' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
    }

    private openSealed(
        sealedConnection: string,
        privateKey: string,
    ): SlackAppSealedConnection {
        let connection: any;
        try {
            connection = JSON.parse(
                privateDecrypt(
                    { key: privateKey, oaepHash: 'sha256' },
                    Buffer.from(sealedConnection, 'base64url'),
                ).toString(),
            );
        } catch {}

        if (
            typeof connection?.accessToken !== 'string' ||
            typeof connection.team?.name !== 'string'
        ) {
            throw new SlackAppInstallError(
                'Unleash could not read the token Slack sent. Connect again.',
            );
        }

        return connection;
    }
}
