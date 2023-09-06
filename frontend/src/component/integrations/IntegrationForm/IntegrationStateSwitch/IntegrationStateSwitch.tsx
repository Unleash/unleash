import {
    Box,
    FormControlLabel,
    Paper,
    Switch,
    Typography,
} from '@mui/material';
import { MouseEventHandler, VFC } from 'react';

interface IIntegrationStateSwitchProps {
    checked: boolean;
    onClick: MouseEventHandler<HTMLButtonElement>;
}

export const IntegrationStateSwitch: VFC<IIntegrationStateSwitchProps> = ({
    checked,
    onClick,
}) => {
    return (
        <Paper
            elevation={0}
            sx={theme => ({
                background: theme.palette.background.elevation1,
                padding: theme.spacing(2, 3),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                borderRadius: `${theme.shape.borderRadiusLarge}px`,
            })}
        >
            <Typography component="span">Integration status</Typography>
            <FormControlLabel
                control={<Switch checked={checked} onClick={onClick} />}
                label={
                    <Box
                        component="span"
                        sx={theme => ({ marginLeft: theme.spacing(0.5) })}
                    >
                        {checked ? 'Enabled' : 'Disabled'}
                    </Box>
                }
            />
        </Paper>
    );
};
