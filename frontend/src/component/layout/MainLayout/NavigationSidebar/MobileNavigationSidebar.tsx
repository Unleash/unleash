import type { FC } from 'react';
import {
    PrimaryNavigationList,
    AdminSettingsLink,
    OtherLinksList,
} from './NavigationList.tsx';
import type { NewInUnleash } from './NewInUnleash/NewInUnleash.tsx';
import { SecondaryNavigationList } from './SecondaryNavigationList.tsx';
import { useRoutes } from './useRoutes.ts';

export const MobileNavigationSidebar: FC<{
    onClick: () => void;
    NewInUnleash?: typeof NewInUnleash;
}> = ({ onClick, NewInUnleash }) => {
    const { routes } = useRoutes();

    return (
        <>
            {NewInUnleash ? <NewInUnleash /> : null}
            <PrimaryNavigationList mode='full' onClick={onClick} />
            <SecondaryNavigationList
                routes={routes.mainNavRoutes}
                mode='full'
                onClick={onClick}
            />
            <AdminSettingsLink mode={'full'} onClick={onClick} />
            <OtherLinksList />
        </>
    );
};
