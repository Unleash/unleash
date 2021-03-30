import React from 'react';
import PropTypes from 'prop-types';
import { Grid, IconButton, Icon } from '@material-ui/core';
import MySelect from '../../common/select';
import InputListField from '../../common/input-list-field';

const overrideOptions = [
    { key: 'userId', label: 'userId' },
    { key: 'appName', label: 'appName' },
];

function OverrideConfig({ overrides, updateOverrideType, updateOverrideValues, removeOverride }) {
    const updateValues = i => values => {
        updateOverrideValues(i, values);
    };

    return overrides.map((o, i) => (
        <Grid container key={`override=${i}`}>
            <Grid item md={3}>
                <MySelect
                    name="contextName"
                    label="Context Field"
                    value={o.contextName}
                    options={overrideOptions}
                    onChange={updateOverrideType(i)}
                />
            </Grid>
            <Grid item md={8}>
                <InputListField
                    label="Values (v1, v2, ...)"
                    name="values"
                    placeholder=""
                    style={{ width: '100%' }}
                    values={o.values}
                    updateValues={updateValues(i)}
                />
            </Grid>
            <Grid item md={1}>
                <IconButton onClick={removeOverride(i)}>
                    <Icon>delete</Icon>
                </IconButton>
            </Grid>
        </Grid>
    ));
}

OverrideConfig.propTypes = {
    overrides: PropTypes.array.isRequired,
    updateOverrideType: PropTypes.func.isRequired,
    updateOverrideValues: PropTypes.func.isRequired,
    removeOverride: PropTypes.func.isRequired,
};

export default OverrideConfig;
