import React from 'react';
import PropTypes from 'prop-types';
import StrategiesList from '../strategy/strategies-list';
import AddStrategy from '../strategy/strategies-add';
import { HeaderTitle } from '../../common';

import styles from '../strategy/strategy.module.scss';

function UpdateStrategiesComponent(props) {
    const { editable, configuredStrategies, strategies } = props;
    if (!configuredStrategies || configuredStrategies.length === 0) return null;
    if (!strategies || strategies.length === 0) return null;

    return (
        <section className={styles.paddingDesktop}>
            {editable && <HeaderTitle title="Activation strategies" actions={<AddStrategy {...props} />} />}
            <StrategiesList {...props} />
        </section>
    );
}

UpdateStrategiesComponent.propTypes = {
    featureToggleName: PropTypes.string.isRequired,
    strategies: PropTypes.array,
    configuredStrategies: PropTypes.array.isRequired,
    addStrategy: PropTypes.func.isRequired,
    removeStrategy: PropTypes.func.isRequired,
    moveStrategy: PropTypes.func.isRequired,
    updateStrategy: PropTypes.func.isRequired,
    editable: PropTypes.bool,
};

UpdateStrategiesComponent.defaultProps = {
    editable: true,
};

export default UpdateStrategiesComponent;
