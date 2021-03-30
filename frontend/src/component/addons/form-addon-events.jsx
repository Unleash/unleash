import React from 'react';
import PropTypes from 'prop-types';
import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';

import { styles as commonStyles } from '../common';

const AddonEvents = ({ provider, checkedEvents, setEventValue, error }) => {
    if (!provider) return null;

    return (
        <React.Fragment>
            <h4>Events</h4>
            <span className={commonStyles.error}>{error}</span>
            <Grid container spacing={0}>
                {provider.events.map(e => (
                    <Grid item xs={4} key={e}>
                        <FormControlLabel
                            control={<Checkbox checked={checkedEvents.includes(e)} onChange={setEventValue(e)} />}
                            label={e}
                        />
                    </Grid>
                ))}
            </Grid>
        </React.Fragment>
    );
};

AddonEvents.propTypes = {
    provider: PropTypes.object,
    checkedEvents: PropTypes.array.isRequired,
    setEventValue: PropTypes.func.isRequired,
    error: PropTypes.string,
};

export default AddonEvents;
