import type { Logger } from '../../logger';
import {
    type IUnleashConfig,
    type IAuditUser,
    FeatureLinkAddedEvent,
    FeatureLinkUpdatedEvent,
    FeatureLinkRemovedEvent,
} from '../../types';
import type {
    IFeatureLink,
    IFeatureLinkStore,
} from './feature-link-store-type';
import type EventService from '../events/event-service';
import { NotFoundError } from '../../error';

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

    async createLink(
        projectId: string,
        newLink: Omit<IFeatureLink, 'id'>,
        auditUser: IAuditUser,
    ): Promise<IFeatureLink> {
        const link = await this.featureLinkStore.create(newLink);

        await this.eventService.storeEvent(
            new FeatureLinkAddedEvent({
                featureName: newLink.featureName,
                project: projectId,
                data: { url: newLink.url, title: newLink.title },
                auditUser,
            }),
        );

        return link;
    }

    async updateLink(
        { projectId, linkId }: { projectId: string; linkId: string },
        updatedLink: Omit<IFeatureLink, 'id'>,
        auditUser: IAuditUser,
    ): Promise<IFeatureLink> {
        const preData = await this.featureLinkStore.get(linkId);

        if (!preData) {
            throw new NotFoundError(`Could not find link with id ${linkId}`);
        }

        const link = await this.featureLinkStore.update({
            ...updatedLink,
            id: linkId,
        });

        await this.eventService.storeEvent(
            new FeatureLinkUpdatedEvent({
                featureName: updatedLink.featureName,
                project: projectId,
                data: { url: link.url, title: link.title },
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
