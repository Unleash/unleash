import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from 'react-mdl';
import Select from 'react-select';
import MySelect from '../../../common/select';
import InputListField from '../../../common/input-list-field';
import { selectStyles } from '../../../common';

const constraintOperators = [
    { key: 'IN', label: 'IN' },
    { key: 'NOT_IN', label: 'NOT_IN' },
];

export default class StrategyConstraintInputField extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        constraint: PropTypes.object.isRequired,
        updateConstraint: PropTypes.func.isRequired,
        removeConstraint: PropTypes.func.isRequired,
        contextFields: PropTypes.array.isRequired,
    };

    constructor() {
        super();
        this.state = { error: undefined };
    }

    onBlur = evt => {
        evt.preventDefault();
        const { constraint, updateConstraint } = this.props;
        const values = constraint.values;
        const filtered = values.filter(v => v).map(v => v.trim());
        if (filtered.length !== values.length) {
            updateConstraint(filtered, 'values');
        }
        if (filtered.length === 0) {
            this.setState({ error: 'You need to specify at least one value' });
        } else {
            this.setState({ error: undefined });
        }
    };

    updateConstraintValues = evt => {
        const { updateConstraint } = this.props;
        const values = evt.target.value.split(/,\s?/);
        const trimmedValues = values.map(v => v.trim());
        updateConstraint(trimmedValues, 'values');
    };

    handleKeyDownConstraintValues = evt => {
        const { updateConstraint } = this.props;

        if (evt.key === 'Backspace') {
            const currentValue = evt.target.value;
            if (currentValue.endsWith(', ')) {
                evt.preventDefault();
                const value = currentValue.slice(0, -2);
                updateConstraint(value.split(/,\s*/), 'values');
            }
        }
    };

    handleChangeValue = selectedOptions => {
        const { updateConstraint } = this.props;
        const values = selectedOptions ? selectedOptions.map(o => o.value) : [];
        updateConstraint(values, 'values');
    };

    render() {
        const { contextFields, constraint, removeConstraint, updateConstraint } = this.props;
        const constraintContextNames = contextFields.map(f => ({ key: f.name, label: f.name }));
        const constraintDef = contextFields.find(c => c.name === constraint.contextName);

        const options =
            constraintDef && constraintDef.legalValues && constraintDef.legalValues.length > 0
                ? constraintDef.legalValues.map(l => ({ value: l, label: l }))
                : undefined;
        const values = constraint.values.map(v => ({ value: v, label: v }));

        return (
            <tr>
                <td>
                    <MySelect
                        name="contextName"
                        label="Context Field"
                        options={constraintContextNames}
                        value={constraint.contextName}
                        onChange={evt => updateConstraint(evt.target.value, 'contextName')}
                        style={{ width: 'auto' }}
                    />
                </td>
                <td>
                    <MySelect
                        name="operator"
                        label="Operator"
                        options={constraintOperators}
                        value={constraint.operator}
                        onChange={evt => updateConstraint(evt.target.value, 'operator')}
                        style={{ width: 'auto' }}
                    />
                </td>
                <td style={{ width: '100%' }}>
                    {options ? (
                        <Select
                            styles={selectStyles}
                            value={values}
                            options={options}
                            isMulti
                            onChange={this.handleChangeValue}
                        />
                    ) : (
                        <InputListField
                            name="values"
                            error={this.state.error}
                            onBlur={this.onBlur}
                            values={constraint.values}
                            label="Values (v1, v2, v3)"
                            updateValues={values => updateConstraint(values, 'values')}
                        />
                    )}
                </td>
                <td>
                    <IconButton name="delete" onClick={removeConstraint} />
                </td>
            </tr>
        );
    }
}
