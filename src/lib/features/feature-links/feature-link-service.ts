import type { Logger } from '../../logger.js';
import {
    FeatureLinkAddedEvent,
    FeatureLinkRemovedEvent,
    FeatureLinkUpdatedEvent,
    type IAuditUser,
    type IFlagResolver,
    type IUnleashConfig,
} from '../../types/index.js';
import type {
    IFeatureLink,
    IFeatureLinkStore,
} from './feature-link-store-type.js';
import type EventService from '../events/event-service.js';
import {
    BadDataError,
    NotFoundError,
    OperationDeniedError,
} from '../../error/index.js';
import normalizeUrl from 'normalize-url';
import { parse } from 'tldts';
import { FEAUTRE_LINK_COUNT } from '../metrics/impact/define-impact-metrics.js';

interface IFeatureLinkStoreObj {
    featureLinkStore: IFeatureLinkStore;
}

export default class FeatureLinkService {
    private logger: Logger;
    private featureLinkStore: IFeatureLinkStore;
    private eventService: EventService;
    private flagResolver: IFlagResolver;

    constructor(
        stores: IFeatureLinkStoreObj,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        eventService: EventService,
    ) {
        this.logger = getLogger('feature-links/feature-link-service.ts');
        this.featureLinkStore = stores.featureLinkStore;
        this.eventService = eventService;
        this.flagResolver = flagResolver;
    }

    async getAll(): Promise<IFeatureLink[]> {
        return this.featureLinkStore.getAll();
    }

    private normalize(url: string) {
        try {
            return normalizeUrl(url, { defaultProtocol: 'https' });
        } catch (_e) {
            throw new BadDataError(`Invalid URL: ${url}`);
        }
    }

    async createLink(
        projectId: string,
        newLink: Omit<IFeatureLink, 'id' | 'domain'>,
        auditUser: IAuditUser,
    ): Promise<IFeatureLink> {
        const countLinks = await this.featureLinkStore.count({
            featureName: newLink.featureName,
        });
        if (countLinks >= 10) {
            throw new OperationDeniedError(
                'Too many links (10) exist for this feature',
            );
        }
        const normalizedUrl = this.normalize(newLink.url);
        const { domainWithoutSuffix } = parse(normalizedUrl);

        const link = await this.featureLinkStore.insert({
            ...newLink,
            url: normalizedUrl,
            domain: domainWithoutSuffix,
        });

        this.flagResolver.impactMetrics?.incrementCounter(FEAUTRE_LINK_COUNT);

        await this.eventService.storeEvent(
            new FeatureLinkAddedEvent({
                featureName: newLink.featureName,
                project: projectId,
                data: { url: normalizedUrl, title: newLink.title },
                auditUser,
            }),
        );

        return link;
    }

    async updateLink(
        { projectId, linkId }: { projectId: string; linkId: string },
        updatedLink: Omit<IFeatureLink, 'id' | 'domain'>,
        auditUser: IAuditUser,
    ): Promise<IFeatureLink> {
        const normalizedUrl = this.normalize(updatedLink.url);
        const { domainWithoutSuffix } = parse(normalizedUrl);

        const preData = await this.featureLinkStore.get(linkId);

        if (!preData) {
            throw new NotFoundError(`Could not find link with id ${linkId}`);
        }

        const link = await this.featureLinkStore.update(linkId, {
            ...updatedLink,
            url: normalizedUrl,
            domain: domainWithoutSuffix,
        });

        await this.eventService.storeEvent(
            new FeatureLinkUpdatedEvent({
                featureName: updatedLink.featureName,
                project: projectId,
                data: { url: normalizedUrl, title: link.title },
                preData: { url: preData.url, title: preData.title },
                auditUser,
            }),
        );

        return link;
    }

    async deleteLink(
        { projectId, linkId }: { projectId: string; linkId: string },
        auditUser: IAuditUser,
    ): Promise<void> {
        const link = await this.featureLinkStore.get(linkId);

        if (!link) {
            throw new NotFoundError(`Could not find link with id ${linkId}`);
        }

        await this.featureLinkStore.delete(linkId);

        await this.eventService.storeEvent(
            new FeatureLinkRemovedEvent({
                featureName: link.featureName,
                project: projectId,
                preData: { url: link.url, title: link.title },
                auditUser,
            }),
        );
    }
}
