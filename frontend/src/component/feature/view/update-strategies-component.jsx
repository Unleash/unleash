import React from 'react';
import PropTypes from 'prop-types';
import StrategiesList from '../strategy/strategies-list-container';

// TODO: do we still need this wrapper?
function UpdateStrategiesComponent(props) {
    const { configuredStrategies } = props;
    if (!configuredStrategies || configuredStrategies.length === 0) return null;

    return (
        <section>
            <StrategiesList {...props} />
        </section>
    );
}

UpdateStrategiesComponent.propTypes = {
    featureToggleName: PropTypes.string.isRequired,
    strategies: PropTypes.array,
    configuredStrategies: PropTypes.array.isRequired,
    editable: PropTypes.bool,
};

UpdateStrategiesComponent.defaultProps = {
    editable: true,
};

export default UpdateStrategiesComponent;
