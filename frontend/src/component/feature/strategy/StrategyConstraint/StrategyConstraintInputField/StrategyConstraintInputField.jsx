import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, IconButton, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import MySelect from '../../../../common/select';
import InputListField from '../../../../common/input-list-field';
import ConditionallyRender from '../../../../common/ConditionallyRender/ConditionallyRender';
import { useCommonStyles } from '../../../../../common.styles';
import { useStyles } from './StrategyConstraintInputField.styles';

const constraintOperators = [
    { key: 'IN', label: 'IN' },
    { key: 'NOT_IN', label: 'NOT_IN' },
];

const StrategyConstraintInputField = ({ constraint, updateConstraint, removeConstraint, contextFields }) => {
    const [error, setError] = useState();
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const onBlur = evt => {
        evt.preventDefault();
        const values = constraint.values;
        const filtered = values.filter(v => v).map(v => v.trim());
        if (filtered.length !== values.length) {
            updateConstraint(filtered, 'values');
        }
        if (filtered.length === 0) {
            setError('You need to specify at least one value');
        } else {
            setError(undefined);
        }
    };

    const handleChangeValue = selectedOptions => {
        const values = selectedOptions ? selectedOptions.map(o => o.value) : [];
        updateConstraint(values, 'values');
    };

    const constraintContextNames = contextFields.map(f => ({
        key: f.name,
        label: f.name,
    }));
    const constraintDef = contextFields.find(c => c.name === constraint.contextName);

    const options =
        constraintDef && constraintDef.legalValues && constraintDef.legalValues.length > 0
            ? constraintDef.legalValues.map(l => ({ value: l, label: l }))
            : undefined;
    const values = constraint.values.map(v => ({ value: v, label: v }));

    return (
        <tr className={commonStyles.contentSpacingY}>
            <td>
                <MySelect
                    name="contextName"
                    label="Context Field"
                    options={constraintContextNames}
                    value={constraint.contextName}
                    onChange={evt => updateConstraint(evt.target.value, 'contextName')}
                    className={styles.contextField}
                />
            </td>
            <td>
                <MySelect
                    name="operator"
                    label="Operator"
                    options={constraintOperators}
                    value={constraint.operator}
                    onChange={evt => updateConstraint(evt.target.value, 'operator')}
                    className={styles.operator}
                />
            </td>
            <td style={{ width: '100%' }}>
                <ConditionallyRender
                    condition={options}
                    show={
                        <Autocomplete
                            multiple
                            size="small"
                            options={options}
                            getOptionLabel={option => option.label}
                            getOptionSelected={(option, value) => option.value === value.value}
                            defaultValue={values}
                            filterSelectedOptions
                            filterOptions={options => options.filter(o => !values.some(v => v.value === o.value))}
                            onChange={(evt, values) => handleChangeValue(values)}
                            renderInput={params => <TextField {...params} variant="outlined" label="Values" />}
                        />
                    }
                    elseShow={
                        <InputListField
                            name="values"
                            error={error}
                            onBlur={onBlur}
                            values={constraint.values}
                            label="Values (v1, v2, v3)"
                            updateValues={values => updateConstraint(values, 'values')}
                        />
                    }
                />
            </td>
            <td>
                <IconButton onClick={removeConstraint}>
                    <Icon>delete</Icon>
                </IconButton>
            </td>
        </tr>
    );
};
StrategyConstraintInputField.propTypes = {
    id: PropTypes.string.isRequired,
    constraint: PropTypes.object.isRequired,
    updateConstraint: PropTypes.func.isRequired,
    removeConstraint: PropTypes.func.isRequired,
    contextFields: PropTypes.array.isRequired,
};

export default StrategyConstraintInputField;
