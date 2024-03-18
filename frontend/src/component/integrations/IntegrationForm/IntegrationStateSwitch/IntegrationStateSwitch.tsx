import {
    Box,
    FormControlLabel,
    Switch,
    Typography,
    styled,
} from '@mui/material';
import type { MouseEventHandler, VFC } from 'react';

interface IIntegrationStateSwitchProps {
    checked: boolean;
    onClick: MouseEventHandler<HTMLButtonElement>;
}

const StyledContainer = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
});

export const IntegrationStateSwitch: VFC<IIntegrationStateSwitchProps> = ({
    checked,
    onClick,
}) => {
    return (
        <StyledContainer>
            <Typography component='span'>Integration status</Typography>
            <FormControlLabel
                control={<Switch checked={checked} onClick={onClick} />}
                label={
                    <Box
                        component='span'
                        sx={(theme) => ({ marginLeft: theme.spacing(0.5) })}
                    >
                        {checked ? 'Enabled' : 'Disabled'}
                    </Box>
                }
            />
        </StyledContainer>
    );
};
