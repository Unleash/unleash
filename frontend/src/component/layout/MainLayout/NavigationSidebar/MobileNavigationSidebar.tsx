import type { FC } from 'react';
import {
    PrimaryNavigationList,
    AdminSettingsLink,
    OtherLinksList,
} from './NavigationList.tsx';
import type { NewInUnleash } from './NewInUnleash/NewInUnleash.tsx';
import { ConfigurationNavigationList } from './ConfigurationNavigationList.tsx';
import { useRoutes } from './useRoutes.ts';
import { useUiFlag } from 'hooks/useUiFlag.ts';

export const MobileNavigationSidebar: FC<{
    onClick: () => void;
    NewInUnleash?: typeof NewInUnleash;
}> = ({ onClick, NewInUnleash }) => {
    const { routes } = useRoutes();
    const sideMenuCleanup = useUiFlag('sideMenuCleanup');

    return (
        <>
            {NewInUnleash ? <NewInUnleash /> : null}
            <PrimaryNavigationList
                mode='full'
                onClick={onClick}
                setMode={() => {}}
            />
            {!sideMenuCleanup ? (
                <ConfigurationNavigationList
                    routes={routes.mainNavRoutes}
                    mode='full'
                    onClick={onClick}
                />
            ) : null}
            <AdminSettingsLink mode={'full'} onClick={onClick} />
            <OtherLinksList />
        </>
    );
};
