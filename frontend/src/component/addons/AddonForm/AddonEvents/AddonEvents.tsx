import React from 'react';
import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';

import { styles as commonStyles } from '../../../common';
import { IAddonProvider } from '../../../../interfaces/addons';

interface IAddonProps {
    provider: IAddonProvider;
    checkedEvents: string[];
    setEventValue: (
        name: string
    ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
    error: Record<string, string>;
}

export const AddonEvents = ({
    provider,
    checkedEvents,
    setEventValue,
    error,
}: IAddonProps) => {
    if (!provider) return null;

    return (
        <React.Fragment>
            <h4>Events</h4>
            <span className={commonStyles.error}>{error}</span>
            <Grid container spacing={0}>
                {provider.events.map(e => (
                    <Grid item xs={4} key={e}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={checkedEvents.includes(e)}
                                    onChange={setEventValue(e)}
                                />
                            }
                            label={e}
                        />
                    </Grid>
                ))}
            </Grid>
        </React.Fragment>
    );
};
