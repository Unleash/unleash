export interface IPermission {
    id: number;
    name: string;
    displayName: string;
    environment?: string;
}

export interface IPermissions {
    root: IPermission[];
    project: IPermission[];
    environments: IProjectEnvironmentPermissions[];
}

export interface IProjectEnvironmentPermissions {
    name: string;
    permissions: IPermission[];
}

export interface ICheckedPermissions {
    [key: string]: IPermission;
}
