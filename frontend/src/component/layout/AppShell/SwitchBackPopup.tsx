import { Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNewNavigation } from 'hooks/useNewNavigation';
import { NavigationPopup } from '../NavigationPopup/NavigationPopup.tsx';

export const SwitchBackPopup = () => {
    const { showSwitchBackPopup, dismissSwitchBackPopup, setEnabled } =
        useNewNavigation();

    if (!showSwitchBackPopup) {
        return null;
    }

    return (
        <NavigationPopup
            icon={<CheckIcon />}
            iconTone='success'
            title='You are on the new layout'
            description='Changed your mind? Switch back here or from your settings menu.'
            actions={
                <Button
                    variant='outlined'
                    color='inherit'
                    size='small'
                    sx={{ borderColor: 'currentColor' }}
                    onClick={() => setEnabled(false)}
                >
                    Switch back
                </Button>
            }
            dismissLabel='Dismiss switch back popup'
            onDismiss={dismissSwitchBackPopup}
        />
    );
};
