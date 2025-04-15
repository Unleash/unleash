import {
    Box,
    FormControlLabel,
    styled,
    Checkbox,
    Typography,
} from '@mui/material';
import type { VFC } from 'react';

interface IFeatureStrategyEnabledDisabledProps {
    enabled: boolean;
    onToggleEnabled: () => void;
}

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledCheckboxRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
}));

export const FeatureStrategyEnabledDisabled: VFC<
    IFeatureStrategyEnabledDisabledProps
> = ({ enabled, onToggleEnabled }) => {
    return (
        <StyledBox>
            <Typography variant='body2' fontWeight='bold'>
                Strategy Status
            </Typography>
            <StyledCheckboxRow>
                <FormControlLabel
                    control={
                        <Checkbox
                            name='enabled'
                            onChange={onToggleEnabled}
                            checked={enabled}
                        />
                    }
                    label={<Typography variant='body2'>Active</Typography>}
                />
                <Typography variant='body2' color='text.secondary'>
                    Strategy will be exposed when environment is enabled
                </Typography>
            </StyledCheckboxRow>
        </StyledBox>
    );
};
