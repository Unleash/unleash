import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

export default function UnknownStrategy({ strategy }) {
    const { name } = strategy;
    return (
        <div>
            <p>The strategy "{name}" does not exist on this server.</p>
            <Link to={`/strategies/create?name=${name}`}>Want to create it now?</Link>
        </div>
    );
}

UnknownStrategy.propTypes = {
    strategy: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,
};
