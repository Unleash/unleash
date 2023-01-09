import React from 'react';
import { Alert } from '@mui/material';

export const MaintenanceTooltip = () => {
    return (
        <Alert severity="warning">
            <p>
                <b>Heads up!</b> If you enable maintenance mode, edit access in
                the entire system will be disabled for all the users (admins,
                editors, custom roles, etc). During this time nobody will be
                able to do changes or to make new configurations.
            </p>
        </Alert>
    );
};
