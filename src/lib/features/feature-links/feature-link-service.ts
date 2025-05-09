import type { Logger } from '../../logger';
import {
    FeatureLinkAddedEvent,
    FeatureLinkRemovedEvent,
    FeatureLinkUpdatedEvent,
    type IAuditUser,
    type IUnleashConfig,
} from '../../types';
import type {
    IFeatureLink,
    IFeatureLinkStore,
} from './feature-link-store-type';
import type EventService from '../events/event-service';
import { BadDataError, NotFoundError, OperationDeniedError } from '../../error';
import normalizeUrl from 'normalize-url';
import { parse } from 'tldts';

interface IFeatureLinkStoreObj {
    featureLinkStore: IFeatureLinkStore;
}

export default class FeatureLinkService {
    private logger: Logger;
    private featureLinkStore: IFeatureLinkStore;
    private eventService: EventService;

    constructor(
        stores: IFeatureLinkStoreObj,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.logger = getLogger('feature-links/feature-link-service.ts');
        this.featureLinkStore = stores.featureLinkStore;
        this.eventService = eventService;
    }

    async getAll(): Promise<IFeatureLink[]> {
        return this.featureLinkStore.getAll();
    }

    private normalize(url: string) {
        try {
            return normalizeUrl(url, { defaultProtocol: 'https:' });
        } catch (e) {
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
