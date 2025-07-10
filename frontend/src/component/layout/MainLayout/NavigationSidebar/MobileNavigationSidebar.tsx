import type { FC } from 'react';
import {
    PrimaryNavigationList,
    AdminSettingsLink,
    OtherLinksList,
} from './NavigationList.tsx';
import type { NewInUnleash } from './NewInUnleash/NewInUnleash.tsx';

export const MobileNavigationSidebar: FC<{
    onClick: () => void;
    NewInUnleash?: typeof NewInUnleash;
}> = ({ onClick, NewInUnleash }) => {
    return (
        <>
            {NewInUnleash ? <NewInUnleash /> : null}
            <PrimaryNavigationList
                mode='full'
                onClick={onClick}
                setMode={() => {}}
            />
            <AdminSettingsLink mode={'full'} onClick={onClick} />
            <OtherLinksList />
        </>
    );
};
