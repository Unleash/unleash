import { NotFoundError } from '../../error';
import type {
    IFeatureLink,
    IFeatureLinkStore,
} from './feature-link-store-type';

export default class FakeFeatureLinkStore implements IFeatureLinkStore {
    private links: IFeatureLink[] = [];

    async create(link: Omit<IFeatureLink, 'id'>): Promise<IFeatureLink> {
        const newLink: IFeatureLink = {
            ...link,
            id: String(Math.random()),
        };
        this.links.push(newLink);
        return newLink;
    }

    async delete(id: string): Promise<void> {
        const index = this.links.findIndex((link) => link.id === id);
        if (index !== -1) {
            this.links.splice(index, 1);
        }
    }

    async deleteAll(): Promise<void> {
        this.links = [];
    }

    destroy(): void {}

    async exists(id: string): Promise<boolean> {
        return this.links.some((link) => link.id === id);
    }

    async get(id: string): Promise<IFeatureLink> {
        const link = this.links.find((link) => link.id === id);
        if (link) {
            return link;
        }
        throw new NotFoundError('Could not find feature link');
    }

    async getAll(): Promise<IFeatureLink[]> {
        return this.links;
    }

    async update(link: IFeatureLink): Promise<IFeatureLink> {
        await this.delete(link.id);
        this.links.push(link);
        return link;
    }
}
