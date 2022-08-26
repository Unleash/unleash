import { ReactElement, ReactNode, useMemo } from 'react';
import AccessContext, { IAccessContext } from 'contexts/AccessContext';
import { ADMIN } from './permissions';
import { IPermission } from 'interfaces/user';
import { useAuthPermissions } from 'hooks/api/getters/useAuth/useAuthPermissions';

interface IAccessProviderProps {
    children: ReactNode;
}

export const AccessProvider = ({
    children,
}: IAccessProviderProps): ReactElement => {
    const { permissions } = useAuthPermissions();

    const value: IAccessContext = useMemo(
        () => ({
            isAdmin: checkAdmin(permissions),
            hasAccess: hasAccess.bind(null, permissions),
        }),
        [permissions]
    );

    return (
        <AccessContext.Provider value={value}>
            {children}
        </AccessContext.Provider>
    );
};

export const checkAdmin = (permissions: IPermission[] | undefined): boolean => {
    if (!permissions) {
        return false;
    }

    return permissions.some(p => {
        return p.permission === ADMIN;
    });
};

export const hasAccess = (
    permissions: IPermission[] | undefined,
    permission: string,
    project?: string,
    environment?: string
): boolean => {
    if (!permissions) {
        return false;
    }

    return permissions.some(p => {
        return checkPermission(p, permission, project, environment);
    });
};

const checkPermission = (
    p: IPermission,
    permission: string,
    project?: string,
    environment?: string
): boolean => {
    if (!permission) {
        console.warn(`Missing permission for AccessProvider: ${permission}`);
        return false;
    }

    if (p.permission === ADMIN) {
        return true;
    }

    if (
        p.permission === permission &&
        (p.project === project || p.project === '*') &&
        (p.environment === environment || p.environment === '*')
    ) {
        return true;
    }

    if (
        p.permission === permission &&
        (p.project === project || p.project === '*') &&
        p.environment === null
    ) {
        return true;
    }

    return (
        p.permission === permission &&
        p.project === undefined &&
        p.environment === null
    );
};
