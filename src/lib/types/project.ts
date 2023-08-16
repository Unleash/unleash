export const DEFAULT_PROJECT = 'default';

export interface IProjectRoleUsage {
    project: string;
    role: number;
    userCount: number;
    groupCount: number;
    serviceAccountCount: number;
}
