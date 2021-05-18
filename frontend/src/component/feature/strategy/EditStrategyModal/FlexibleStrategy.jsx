import React from 'react';
import PropTypes from 'prop-types';

import InputPercentage from './input-percentage';
import Select from '../../../common/select';
import { Icon, TextField, Tooltip, Typography } from '@material-ui/core';

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
                .filter(
                    c => !builtInStickinessOptions.find(s => s.key === c.name)
                )
                .map(c => ({ key: c.name, label: c.name }))
        );

    const stickinessOptions = resolveStickiness();

    const rollout = parameters.rollout;
    const stickiness = parameters.stickiness;
    const groupId = parameters.groupId;

    return (
        <div>
            <InputPercentage
                name="Rollout"
                value={1 * rollout}
                onChange={onUpdate('rollout')}
            />
            <br />
            <div>
                <Tooltip
                    placement="right-start"
                    title="Stickiness defines what parameter should be used to ensure that your users get consistency in features. By default unleash will use the first value present in the context in the order of userId, sessionId and random."
                >
                    <Typography
                        variant="subtitle2"
                        style={{
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Stickiness
                        <Icon
                            style={{
                                fontSize: '1rem',
                                color: 'gray',
                                marginLeft: '0.2rem',
                            }}
                        >
                            info
                        </Icon>
                    </Typography>
                </Tooltip>
                <Select
                    name="stickiness"
                    label="Stickiness"
                    options={stickinessOptions}
                    value={stickiness}
                    onChange={e => onUpdate('stickiness')(e, e.target.value)}
                />
                &nbsp;
                <br />
                <br />
                <Tooltip
                    placement="right-start"
                    title="GroupId is used to ensure that different toggles will hash differently for the same user. The groupId defaults to feature toggle name, but you can override it to correlate rollout of multiple feature toggles."
                >
                    <Typography
                        variant="subtitle2"
                        style={{
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        GroupId
                        <Icon
                            style={{
                                fontSize: '1rem',
                                color: 'gray',
                                marginLeft: '0.2rem',
                            }}
                        >
                            info
                        </Icon>
                    </Typography>
                </Tooltip>
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
