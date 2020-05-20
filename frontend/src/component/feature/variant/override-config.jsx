import React from 'react';
import PropTypes from 'prop-types';
import { Textfield, Grid, Cell, IconButton } from 'react-mdl';
import MySelect from '../form/select';

const overrideOptions = [
    { key: 'userId', label: 'userId' },
    { key: 'appName', label: 'appName' },
];

function OverrideConfig({ overrides, updateOverrideOption, removeOverrideOption }) {
    return overrides.map((o, i) => (
        <Grid noSpacing key={`override=${i}`}>
            <Cell col={3}>
                <MySelect
                    name="contextName"
                    label="Context Field"
                    value={o.contextName}
                    options={overrideOptions}
                    onChange={updateOverrideOption(i)}
                />
            </Cell>
            <Cell col={8}>
                <Textfield
                    floatingLabel
                    label="Values"
                    name="values"
                    placeholder="val1, val2, ..."
                    style={{ width: '100%' }}
                    value={o.values}
                    onChange={updateOverrideOption(i)}
                />
            </Cell>
            <Cell col={1} style={{ textAlign: 'right' }}>
                <IconButton name="delete" onClick={removeOverrideOption(i)} />
            </Cell>
        </Grid>
    ));
}

OverrideConfig.propTypes = {
    overrides: PropTypes.array.isRequired,
    updateOverrideOption: PropTypes.func.isRequired,
    removeOverrideOption: PropTypes.func.isRequired,
};

export default OverrideConfig;
