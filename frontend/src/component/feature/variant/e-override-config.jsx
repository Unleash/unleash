import { connect } from 'react-redux';

import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Cell, IconButton } from 'react-mdl';
import Select from 'react-select';
import MySelect from '../../common/select';
import InputListField from '../../common/input-list-field';
import { selectStyles } from '../../common';

function OverrideConfig({ overrides, updateOverrideType, updateOverrideValues, removeOverride, contextDefinitions }) {
    const contextNames = contextDefinitions.map(c => ({ key: c.name, label: c.name }));

    const updateValues = i => values => {
        updateOverrideValues(i, values);
    };

    const updateSelectValues = i => values => {
        updateOverrideValues(i, values ? values.map(v => v.value) : undefined);
    };

    const mapSelectValues = (values = []) => values.map(v => ({ label: v, value: v }));

    return overrides.map((o, i) => {
        const legalValues = contextDefinitions.find(c => c.name === o.contextName).legalValues || [];
        const options = legalValues.map(v => ({ value: v, label: v, key: v }));

        return (
            <Grid noSpacing key={`override=${i}`}>
                <Cell col={3}>
                    <MySelect
                        name="contextName"
                        label="Context Field"
                        value={o.contextName}
                        options={contextNames}
                        onChange={updateOverrideType(i)}
                    />
                </Cell>
                <Cell col={8}>
                    {legalValues && legalValues.length > 0 ? (
                        <div style={{ paddingTop: '12px' }}>
                            <Select
                                key={`override-select=${i}`}
                                styles={selectStyles}
                                value={mapSelectValues(o.values)}
                                options={options}
                                isMulti
                                onChange={updateSelectValues(i)}
                            />
                        </div>
                    ) : (
                        <InputListField
                            label="Values (v1, v2, ...)"
                            name="values"
                            placeholder=""
                            style={{ width: '100%' }}
                            values={o.values}
                            updateValues={updateValues(i)}
                        />
                    )}
                </Cell>
                <Cell col={1} style={{ textAlign: 'right', paddingTop: '12px' }}>
                    <IconButton name="delete" onClick={removeOverride(i)} />
                </Cell>
            </Grid>
        );
    });
}

OverrideConfig.propTypes = {
    overrides: PropTypes.array.isRequired,
    updateOverrideType: PropTypes.func.isRequired,
    updateOverrideValues: PropTypes.func.isRequired,
    removeOverride: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    contextDefinitions: state.context.toJS(),
});

export default connect(mapStateToProps, {})(OverrideConfig);
