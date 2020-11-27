import React, { Component } from 'react';
import { Textfield } from 'react-mdl';
import strategyInputProps from './strategy-input-props';
import Select from '../../common/select';

import StrategyInputPercentage from './input-percentage';

const stickinessOptions = [
    { key: 'default', label: 'default' },
    { key: 'userId', label: 'userId' },
    { key: 'sessionId', label: 'sessionId' },
    { key: 'random', label: 'random' },
];

export default class FlexibleRolloutStrategy extends Component {
    static propTypes = strategyInputProps;

    onConfiguUpdate = (field, evt) => {
        evt.preventDefault();
        const value = evt.target.value;
        this.props.updateParameter(field, value);
    };

    render() {
        const { editable, parameters, index } = this.props;

        const rollout = parameters.rollout;
        const stickiness = parameters.stickiness;
        const groupId = parameters.groupId;

        return (
            <div>
                <br />
                <strong>Rollout</strong>
                <StrategyInputPercentage
                    name="Percentage"
                    value={1 * rollout}
                    minLabel="off"
                    maxLabel="on"
                    disabled={!editable}
                    onChange={evt => this.onConfiguUpdate('rollout', evt)}
                    id={`${index}-groupId`}
                />
                <div>
                    <Select
                        name="stickiness"
                        label="Stickiness"
                        options={stickinessOptions}
                        value={stickiness}
                        disabled={!editable}
                        onChange={evt => this.onConfiguUpdate('stickiness', evt)}
                    />
                    &nbsp;
                    <Textfield
                        floatingLabel
                        label="groupId"
                        value={groupId}
                        disabled={!editable}
                        onChange={evt => this.onConfiguUpdate('groupId', evt)}
                        id={`${index}-groupId`}
                    />{' '}
                </div>
            </div>
        );
    }
}
