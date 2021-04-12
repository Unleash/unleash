import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '@material-ui/core';
import DropdownMenu from '../../common/DropdownMenu/DropdownMenu';

import styles from './strategy.module.scss';

function resolveDefaultParamVale(name, featureToggleName) {
    switch (name) {
        case 'percentage':
        case 'rollout':
            return '100';
        case 'stickiness':
            return 'default';
        case 'groupId':
            return featureToggleName;
        default:
            return '';
    }
}

class AddStrategy extends React.Component {
    static propTypes = {
        strategies: PropTypes.array.isRequired,
        addStrategy: PropTypes.func,
        featureToggleName: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
    };

    addStrategy(strategyName) {
        const featureToggleName = this.props.featureToggleName;
        const selectedStrategy = this.props.strategies.find(
            s => s.name === strategyName
        );
        const parameters = {};

        selectedStrategy.parameters.forEach(({ name }) => {
            parameters[name] = resolveDefaultParamVale(name, featureToggleName);
        });

        this.props.addStrategy({
            name: selectedStrategy.name,
            parameters,
        });
    }

    stopPropagation(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        const addStrategiesOptions = () =>
            this.props.strategies
                .filter(s => !s.deprecated)
                .map(s => (
                    <MenuItem
                        key={s.name}
                        title={s.description}
                        onClick={() => this.addStrategy(s.name)}
                    >
                        {s.name}
                    </MenuItem>
                ));

        return (
            <div>
                <DropdownMenu
                    id="strategies-add"
                    renderOptions={addStrategiesOptions}
                    label="Add strategy"
                    icon="add"
                    className={styles.addStrategyButton}
                    color="secondary"
                    variant="contained"
                />
            </div>
        );
    }
}

export default AddStrategy;
