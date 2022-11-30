import { IFavoriteProject } from '../favorites';
import { Store } from './store';

export interface IFavoriteProjectKey {
    userId: number;
    project: string;
}

export interface IFavoriteProjectsStore
    extends Store<IFavoriteProject, IFavoriteProjectKey> {
    addFavoriteProject(
        favorite: IFavoriteProjectKey,
    ): Promise<IFavoriteProject>;
}
