import IRole from './role';

export interface IProfile {
    rootRole: IRole;
    projects: string[];
}
