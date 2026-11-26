import { Button, SvgIcon } from '@mui/material';
import SideNavigationIcon from 'assets/icons/menu/side-navigation.svg?react';
import { useNewNavigation } from 'hooks/useNewNavigation';
import { NavigationPopup } from '../../NavigationPopup/NavigationPopup.tsx';

export const NewNavigationPopup = () => {
    const { showOptInPopup, dismissOptInPopup, setEnabled } =
        useNewNavigation();

    if (!showOptInPopup) {
        return null;
    }

    return (
        <NavigationPopup
            icon={<SvgIcon component={SideNavigationIcon} inheritViewBox />}
            iconTone='primary'
            title='New layout available'
            description='Simpler navigation and room for new features. You can switch back any time.'
            actions={
                <Button variant='contained' onClick={() => setEnabled(true)}>
                    Try it now
                </Button>
            }
            dismissLabel='Dismiss new layout popup'
            onDismiss={dismissOptInPopup}
        />
    );
};
