export interface IUserProjectRole {
    id: number;
    name: string;
    type: string;
    project?: string;
    description?: string;
}

export interface IUserProjectRoles {
    version: number;
    roles: IUserProjectRole[];
}
