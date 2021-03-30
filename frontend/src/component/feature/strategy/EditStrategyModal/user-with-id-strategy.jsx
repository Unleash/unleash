import React from 'react';
import strategyInputProps from './strategy-input-props';
import InputList from './input-list';

export default function UserWithIdStrategy({ editable, parameters, updateParameter }) {
    const value = parameters.userIds;

    let list = [];
    if (typeof value === 'string') {
        list = value
            .trim()
            .split(',')
            .filter(Boolean);
    }

    return (
        <div>
            <InputList name="userIds" list={list} disabled={!editable} setConfig={updateParameter} />
        </div>
    );
}

UserWithIdStrategy.propTypes = strategyInputProps;
