import {
    ROOT_PERMISSION_TYPE,
    PROJECT_PERMISSION_TYPE,
    ENVIRONMENT_PERMISSION_TYPE,
} from '@server/util/constants';

export type PermissionType =
    | typeof ROOT_PERMISSION_TYPE
    | typeof PROJECT_PERMISSION_TYPE
    | typeof ENVIRONMENT_PERMISSION_TYPE;

export interface IPermission {
    id: number;
    name: string;
    displayName: string;
    type: PermissionType;
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

export interface IPermissionCategory {
    label: string;
    type: PermissionType;
    permissions: IPermission[];
}
