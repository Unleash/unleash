import {
    Box,
    FormControlLabel,
    Switch,
    Typography,
    styled,
} from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';
import { VFC } from 'react';

interface IFeatureStrategyEnabledDisabledProps {
    enabled: boolean;
    onToggleEnabled: () => void;
}

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.elevation1,
    padding: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
}));

export const FeatureStrategyEnabledDisabled: VFC<
    IFeatureStrategyEnabledDisabledProps
> = ({ enabled, onToggleEnabled }) => {
    const strategyConfigurationEnabled = useUiFlag('newStrategyConfiguration');

    if (strategyConfigurationEnabled) {
        return (
            <StyledBox>
                <Typography>Strategy Status</Typography>
                <FormControlLabel
                    control={
                        <Switch
                            name='enabled'
                            onChange={onToggleEnabled}
                            checked={enabled}
                        />
                    }
                    label='Enabled'
                />
            </StyledBox>
        );
    }

    return (
        <FormControlLabel
            control={
                <Switch
                    name='enabled'
                    onChange={onToggleEnabled}
                    checked={enabled}
                />
            }
            label='Enabled &ndash; This strategy will be used when evaluating feature toggles.'
        />
    );
};
