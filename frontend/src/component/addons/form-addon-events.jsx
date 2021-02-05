import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Grid, Cell } from 'react-mdl';

import { styles as commonStyles } from '../common';

const AddonEvents = ({ provider, checkedEvents, setEventValue, error }) => {
    if (!provider) return null;

    return (
        <React.Fragment>
            <h4>Events</h4>
            <span className={commonStyles.error}>{error}</span>
            <Grid className="demo-grid-ruler">
                {provider.events.map(e => (
                    <Cell col={4} key={e}>
                        <Checkbox label={e} ripple checked={checkedEvents.includes(e)} onChange={setEventValue(e)} />
                    </Cell>
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
