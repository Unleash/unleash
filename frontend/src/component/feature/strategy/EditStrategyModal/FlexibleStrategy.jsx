import React from 'react';
import PropTypes from 'prop-types';

import InputPercentage from './input-percentage';
import Select from '../../../common/select';
import { TextField, Typography } from '@material-ui/core';

const builtInStickinessOptions = [
    { key: 'default', label: 'default' },
    { key: 'userId', label: 'userId' },
    { key: 'sessionId', label: 'sessionId' },
    { key: 'random', label: 'random' },
];

const FlexibleStrategy = ({ updateParameter, parameters, context }) => {
    const onUpdate = field => (_, newValue) => {
        updateParameter(field, newValue);
    };

    const resolveStickiness = () =>
        builtInStickinessOptions.concat(
            context
                .filter(c => c.stickiness)
                .filter(c => !builtInStickinessOptions.find(s => s.key === c.name))
                .map(c => ({ key: c.name, label: c.name }))
        );

    const stickinessOptions = resolveStickiness();

    const rollout = parameters.rollout;
    const stickiness = parameters.stickiness;
    const groupId = parameters.groupId;

    return (
        <div>
            <InputPercentage name="Rollout" value={1 * rollout} onChange={onUpdate('rollout')} />
            <br />
            <div>
                <Typography variant="subtitle2" gutterBottom>
                    Stickiness
                </Typography>
                <br />
                <Select
                    name="stickiness"
                    label="Stickiness"
                    options={stickinessOptions}
                    value={stickiness}
                    onChange={e => onUpdate('stickiness')(e, e.target.value)}
                />
                &nbsp;
                <TextField
                    label="groupId"
                    size="small"
                    variant="outlined"
                    value={groupId}
                    onChange={e => onUpdate('groupId')(e, e.target.value)}
                />
            </div>
        </div>
    );
};

FlexibleStrategy.propTypes = {
    parameters: PropTypes.object.isRequired,
    updateParameter: PropTypes.func.isRequired,
    context: PropTypes.array.isRequired,
};

export default FlexibleStrategy;
