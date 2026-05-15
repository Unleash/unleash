import type { FC } from 'react';
import {
    PrimaryNavigationList,
    AdminSettingsLink,
    OtherLinksList,
} from './NavigationList.tsx';

export const MobileNavigationSidebar: FC<{
    onClick: () => void;
}> = ({ onClick }) => {
    return (
        <>
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
