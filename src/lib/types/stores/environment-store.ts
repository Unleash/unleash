import { IEnvironment } from '../model';
import { Store } from './store';

export interface IEnvironmentStore extends Store<IEnvironment, string> {
    upsert(env: IEnvironment): Promise<IEnvironment>;
}
