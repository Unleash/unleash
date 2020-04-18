import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfield } from 'react-mdl';
import Select from './select';

import StrategyInputPercentage from './strategy-input-percentage';

const stickinessOptions = [
    { key: 'default', label: 'default' },
    { key: 'userId', label: 'userId' },
    { key: 'sessionId', label: 'sessionId' },
    { key: 'random', label: 'random' },
];

export default class FlexibleRolloutStrategy extends Component {
    static propTypes = {
        strategy: PropTypes.object.isRequired,
        featureToggleName: PropTypes.string.isRequired,
        updateStrategy: PropTypes.func.isRequired,
        handleConfigChange: PropTypes.func.isRequired,
    };

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount() {
        const { strategy, featureToggleName } = this.props;
        if (!strategy.parameters.rollout) {
            this.setConfig('rollout', 100);
        }

        if (!strategy.parameters.stickiness) {
            this.setConfig('stickiness', 'default');
        }

        if (!strategy.parameters.groupId) {
            this.setConfig('groupId', featureToggleName);
        }
    }

    setConfig = (key, value) => {
        const parameters = this.props.strategy.parameters || {};
        parameters[key] = value;

        const updatedStrategy = Object.assign({}, this.props.strategy, {
            parameters,
        });

        this.props.updateStrategy(updatedStrategy);
    };

    render() {
        const { strategy, handleConfigChange } = this.props;

        const rollout = strategy.parameters.rollout;
        const stickiness = strategy.parameters.stickiness;
        const groupId = strategy.parameters.groupId;

        return (
            <div>
                <br />
                <h5>Rollout</h5>
                <StrategyInputPercentage
                    name="percentage"
                    value={1 * rollout}
                    minLabel="off"
                    maxLabel="on"
                    onChange={evt => handleConfigChange('rollout', evt)}
                />
                <div style={{ margin: '0 17px' }}>
                    <Select
                        name="stickiness"
                        label="Stickiness"
                        options={stickinessOptions}
                        value={stickiness}
                        onChange={evt => handleConfigChange('stickiness', evt)}
                    />
                    &nbsp;
                    <Textfield
                        floatingLabel
                        label="groupId"
                        value={groupId}
                        onChange={evt => handleConfigChange('groupId', evt)}
                    />{' '}
                </div>
            </div>
        );
    }
}
