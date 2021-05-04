import { FC } from 'react';

import AccessContext from '../../contexts/AccessContext';
import { ADMIN } from './permissions';

// TODO: Type up redux store
interface IAccessProvider {
    store: any;
}

interface IPermission {
    permission: string;
    project: string | null;
}

const AccessProvider: FC<IAccessProvider> = ({ store, children }) => {
    const hasAccess = (permission: string, project: string) => {
        const permissions = store.getState().user.get('permissions') || [];

        const result = permissions.some((p: IPermission) => {
            if (p.permission === ADMIN) {
                return true;
            }
            if (p.permission === permission && p.project === project) {
                return true;
            }
            return false;
        });

        return result;
    };

    const context = { hasAccess };

    return (
        <AccessContext.Provider value={context}>
            {children}
        </AccessContext.Provider>
    );
};

export default AccessProvider;
