import { FC } from 'react';

import AccessContext from '../../../contexts/AccessContext';
import useUser from '../../../hooks/api/getters/useUser/useUser';
import { ADMIN } from './permissions';

// TODO: Type up redux store
interface IAccessProvider {
    store: any;
}

interface IPermission {
    permission: string;
    project?: string | null;
    environment: string | null;
}

const AccessProvider: FC<IAccessProvider> = ({ store, children }) => {
    const { permissions } = useUser();
    const isAdminHigherOrder = () => {
        let called = false;
        let result = false;

        return () => {
            if (called) return result;
            const permissions = store.getState().user.get('permissions') || [];
            result = permissions.some(
                (p: IPermission) => p.permission === ADMIN
            );

            if (permissions.length > 0) {
                called = true;
            }
        };
    };

    const isAdmin = isAdminHigherOrder();

    const hasAccess = (
        permission: string,
        project: string,
        environment?: string
    ) => {
        const result = permissions.some((p: IPermission) => {
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

            if (
                p.permission === permission &&
                p.project === undefined &&
                p.environment === null
            ) {
                return true;
            }

            return false;
        });

        return result;
    };

    const context = { hasAccess, isAdmin };

    return (
        <AccessContext.Provider value={context}>
            {children}
        </AccessContext.Provider>
    );
};

export default AccessProvider;
