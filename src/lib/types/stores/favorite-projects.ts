import type { IFavoriteProject } from '../favorites.js';
import type { Store } from './store.js';

export interface IFavoriteProjectKey {
    userId: number;
    project: string;
}

export interface IFavoriteProjectsStore
    extends Store<IFavoriteProject, IFavoriteProjectKey> {
    addFavoriteProject(
        favorite: IFavoriteProjectKey,
    ): Promise<IFavoriteProject | undefined>;
}
