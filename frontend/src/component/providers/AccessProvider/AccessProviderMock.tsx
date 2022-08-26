import { ReactElement, ReactNode, useMemo } from 'react';
import AccessContext, { IAccessContext } from 'contexts/AccessContext';
import { IPermission } from 'interfaces/user';
import {
    checkAdmin,
    hasAccess,
} from 'component/providers/AccessProvider/AccessProvider';

interface IAccessProviderProps {
    permissions: IPermission[];
    children: ReactNode;
}

export const AccessProviderMock = ({
    permissions,
    children,
}: IAccessProviderProps): ReactElement => {
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
