import {
    FeatureToggle,
    IFeatureToggleClient,
    IFeatureToggleQuery,
} from '../../lib/types/model';
import { IFeatureToggleClientStore } from '../../lib/types/stores/feature-toggle-client-store';

export default class FakeFeatureToggleClientStore
    implements IFeatureToggleClientStore
{
    featureToggles: FeatureToggle[] = [];

    async getFeatures(
        featureQuery?: IFeatureToggleQuery,
        archived: boolean = false,
    ): Promise<IFeatureToggleClient[]> {
        const rows = this.featureToggles.filter((toggle) => {
            if (featureQuery.namePrefix) {
                if (featureQuery.project) {
                    return (
                        toggle.name.startsWith(featureQuery.namePrefix) &&
                        featureQuery.project.some((project) =>
                            project.includes(toggle.project),
                        )
                    );
                }
                return toggle.name.startsWith(featureQuery.namePrefix);
            }
            if (featureQuery.project) {
                return featureQuery.project.some((project) =>
                    project.includes(toggle.project),
                );
            }
            return toggle.archived === archived;
        });
        const clientRows: IFeatureToggleClient[] = rows.map((t) => ({
            ...t,
            enabled: true,
            strategies: [],
            description: t.description || '',
            type: t.type || 'Release',
            stale: t.stale || false,
            variants: [],
        }));
        return Promise.resolve(clientRows);
    }

    async getClient(
        query?: IFeatureToggleQuery,
    ): Promise<IFeatureToggleClient[]> {
        return this.getFeatures(query);
    }

    async getAdmin(
        query?: IFeatureToggleQuery,
        archived: boolean = false,
    ): Promise<IFeatureToggleClient[]> {
        return this.getFeatures(query, archived);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async createFeature(feature: any): Promise<void> {
        this.featureToggles.push({
            project: feature.project || 'default',
            createdAt: new Date(),
            archived: false,
            ...feature,
        });
        return Promise.resolve();
    }
}
