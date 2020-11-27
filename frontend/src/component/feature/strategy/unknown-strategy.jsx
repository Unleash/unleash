import React from 'react';
import strategyInputProps from './strategy-input-props';

import { Link } from 'react-router-dom';

export default function UknownStrategy({ strategy }) {
    const { name } = strategy;
    return (
        <div>
            <p>The strategy "{name}" does not exist on this server.</p>
            <Link to={`/strategies/create?name=${name}`}>Want to create it now?</Link>
        </div>
    );
}

UknownStrategy.propTypes = strategyInputProps;
