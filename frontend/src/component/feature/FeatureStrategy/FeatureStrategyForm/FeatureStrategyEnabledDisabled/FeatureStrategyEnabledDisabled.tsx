import { FormControlLabel, Switch } from '@mui/material';
import { VFC } from 'react';

interface IFeatureStrategyEnabledDisabledProps {
    enabled: boolean;
    onToggleEnabled: () => void;
}

export const FeatureStrategyEnabledDisabled: VFC<
    IFeatureStrategyEnabledDisabledProps
> = ({ enabled, onToggleEnabled }) => {
    return (
        <FormControlLabel
            control={
                <Switch
                    name="enabled"
                    onChange={onToggleEnabled}
                    checked={enabled}
                />
            }
            label="Enabled &ndash; This strategy will be used when evaluating feature toggles."
        />
    );
};
