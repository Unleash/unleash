import React from 'react';

export interface IAccessContext {
    isAdmin: boolean;
    hasAccess: (
        permission: string,
        project?: string,
        environment?: string
    ) => boolean;
}

const hasAccessPlaceholder = () => {
    throw new Error('hasAccess called outside AccessContext');
};

const AccessContext = React.createContext<IAccessContext>({
    isAdmin: false,
    hasAccess: hasAccessPlaceholder,
});

export default AccessContext;
