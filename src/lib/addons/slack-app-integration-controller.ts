import type { Response } from 'express';
import Controller from '../routes/controller.js';
import type { IAuthRequest } from '../routes/unleash-types.js';
import type { IUnleashConfig } from '../types/index.js';
import type { IUnleashServices } from '../services/index.js';
import {
    CREATE_ADDON,
    NONE,
    UPDATE_PROJECT_ADDON,
} from '../types/permissions.js';
import PermissionError from '../error/permission-error.js';
import BadDataError from '../error/bad-data-error.js';
import NotFoundError from '../error/notfound-error.js';
import {
    type ISlackAppPendingConnection,
    type SlackAppCallbackBody,
    SlackAppInstallError,
} from './slack-app-install-service.js';

type NoParams = Record<string, never>;

type InstallQuery = {
    parameters?: Record<string, unknown>;
    project?: unknown;
    unleashUrl?: unknown;
};

const PERMISSIONS = [UPDATE_PROJECT_ADDON, CREATE_ADDON];

const integrationsPath = (project: string | undefined): string =>
    project
        ? `/projects/${encodeURIComponent(project)}/settings/integrations`
        : '/integrations';

const errorPath = (project: string | undefined, errorMsg: string): string =>
    `${integrationsPath(project)}/create/slack-app?${new URLSearchParams({ errorMsg })}`;

export class SlackAppIntegrationController extends Controller {
    private slackAppInstallService: IUnleashServices['slackAppInstallService'];

    private accessService: IUnleashServices['accessService'];

    private privateProjectChecker: IUnleashServices['privateProjectChecker'];

    private baseUriPath: string;

    constructor(
        config: IUnleashConfig,
        {
            slackAppInstallService,
            accessService,
            privateProjectChecker,
        }: Pick<
            IUnleashServices,
            'slackAppInstallService' | 'accessService' | 'privateProjectChecker'
        >,
    ) {
        super(config);
        this.slackAppInstallService = slackAppInstallService;
        this.accessService = accessService;
        this.privateProjectChecker = privateProjectChecker;
        this.baseUriPath = config.server.baseUriPath;

        this.get('/install', this.startInstall, NONE);
        this.post('/callback', this.completeInstall, NONE);
    }

    async startInstall(
        req: IAuthRequest<NoParams, unknown, unknown, InstallQuery>,
        res: Response,
    ): Promise<void> {
        const { project, parameters = {}, unleashUrl } = req.query;
        if (project !== undefined && typeof project !== 'string') {
            throw new BadDataError('project must be a single project id.');
        }

        try {
            const site = req.get('sec-fetch-site');
            this.verifyStartedHere(site);
            await this.verifyPermissions(req.user, project);

            const { connectUrl, connection } =
                await this.slackAppInstallService.startInstall(
                    parameters,
                    project,
                    this.unleashUrlFromPage(site, unleashUrl),
                );
            req.session.slackAppInstall = connection;

            res.redirect(connectUrl);
        } catch (error) {
            if (!(error instanceof SlackAppInstallError)) {
                throw error;
            }

            res.redirect(
                `${this.baseUriPath}${errorPath(project, error.message)}`,
            );
        }
    }

    async completeInstall(
        req: IAuthRequest<NoParams, unknown, SlackAppCallbackBody>,
        res: Response<{ path: string }>,
    ): Promise<void> {
        let connection: ISlackAppPendingConnection | undefined =
            req.session.slackAppInstall;
        delete req.session.slackAppInstall;

        try {
            connection = this.slackAppInstallService.verifyConnection(
                connection,
                req.body.state,
            );
            await this.verifyPermissions(req.user, connection.projectId);

            const integrationId =
                await this.slackAppInstallService.completeInstall(
                    connection,
                    req.body,
                    req.audit,
                );

            res.json({
                path: `${integrationsPath(connection.projectId)}/edit/${integrationId}`,
            });
        } catch (error) {
            if (!(error instanceof SlackAppInstallError)) {
                throw error;
            }

            res.json({ path: errorPath(connection?.projectId, error.message) });
        }
    }

    // Browsers too old to send Sec-Fetch-Site are let through.
    private verifyStartedHere(site: string | undefined): void {
        if (site !== undefined && site !== 'same-origin') {
            throw new SlackAppInstallError(
                'Start Install & connect from the integration form in Unleash.',
            );
        }
    }

    private unleashUrlFromPage(
        site: string | undefined,
        unleashUrl: unknown,
    ): string | undefined {
        return site === 'same-origin' && typeof unleashUrl === 'string'
            ? unleashUrl
            : undefined;
    }

    private async verifyPermissions(
        user: IAuthRequest['user'],
        project?: string,
    ): Promise<void> {
        if (
            !(await this.accessService.hasPermission(
                user,
                PERMISSIONS,
                project,
            ))
        ) {
            throw new PermissionError(PERMISSIONS);
        }

        if (
            project &&
            !(await this.privateProjectChecker.hasAccessToProject(
                user.id,
                project,
            ))
        ) {
            throw new NotFoundError();
        }
    }
}
