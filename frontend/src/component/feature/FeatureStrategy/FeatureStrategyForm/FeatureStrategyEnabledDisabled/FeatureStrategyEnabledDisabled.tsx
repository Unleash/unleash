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
    backgroundColor: theme.palette.background.elevation1,
    padding: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
}));

const StyledCheckboxRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
}));

const StyledDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginLeft: theme.spacing(1),
}));

export const FeatureStrategyEnabledDisabled: VFC<
    IFeatureStrategyEnabledDisabledProps
> = ({ enabled, onToggleEnabled }) => {
    return (
        <StyledBox>
            <Typography variant='subtitle1'>Strategy Status</Typography>
            <StyledCheckboxRow>
                <FormControlLabel
                    control={
                        <Checkbox
                            name='enabled'
                            onChange={onToggleEnabled}
                            checked={enabled}
                        />
                    }
                    label='Enabled'
                />
                <StyledDescription>
                    Strategy will be exposed when environment is enabled
                </StyledDescription>
            </StyledCheckboxRow>
        </StyledBox>
    );
};
