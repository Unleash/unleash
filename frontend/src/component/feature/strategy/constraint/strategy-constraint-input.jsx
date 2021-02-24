import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Icon } from 'react-mdl';
import StrategyConstraintInputField from './strategy-constraint-input-field';

export default class StrategyConstraintInput extends Component {
    static propTypes = {
        constraints: PropTypes.array.isRequired,
        updateConstraints: PropTypes.func.isRequired,
        contextNames: PropTypes.array.isRequired,
        contextFields: PropTypes.array.isRequired,
        enabled: PropTypes.bool.isRequired,
    };

    constructor() {
        super();
        this.state = { errors: [] };
    }

    addConstraint = evt => {
        evt.preventDefault();
        const { constraints, updateConstraints, contextNames } = this.props;

        const updatedConstraints = [...constraints];
        updatedConstraints.push({ contextName: contextNames[0], operator: 'IN', values: [] });

        updateConstraints(updatedConstraints);
    };

    removeConstraint = (index, evt) => {
        evt.preventDefault();
        const { constraints, updateConstraints } = this.props;

        const updatedConstraints = [...constraints];
        updatedConstraints.splice(index, 1);

        updateConstraints(updatedConstraints);
    };

    updateConstraint = (index, value, field) => {
        const { constraints } = this.props;

        // TOOD: value should be array
        const updatedConstraints = [...constraints];
        const constraint = updatedConstraints[index];

        constraint[field] = value;

        this.props.updateConstraints(updatedConstraints);
    };

    render() {
        const { constraints, contextFields, enabled } = this.props;

        if (!enabled) {
            return null;
        }

        return (
            <div>
                <strong>{'Constraints '}</strong>
                <Tooltip label={<span>Use context fields to constrain the activation strategy.</span>}>
                    <Icon name="info" style={{ fontSize: '0.9em', color: 'gray' }} />
                </Tooltip>
                <table>
                    <tbody>
                        {constraints.map((c, index) => (
                            <StrategyConstraintInputField
                                key={`${c.contextName}-${index}`}
                                id={`${c.contextName}-${index}`}
                                constraint={c}
                                contextFields={contextFields}
                                updateConstraint={this.updateConstraint.bind(this, index)}
                                removeConstraint={this.removeConstraint.bind(this, index)}
                            />
                        ))}
                    </tbody>
                </table>
                <p>
                    <a href="#add-constraint" title="Add constraint" onClick={this.addConstraint}>
                        Add constraint
                    </a>
                </p>
            </div>
        );
    }
}
