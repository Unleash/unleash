import React from 'react';
import PropTypes from 'prop-types';
import ConfigureStrategy from './strategy-configure-container';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const randomKeys = length => Array.from({ length }, () => Math.random());

class StrategiesList extends React.Component {
    static propTypes = {
        strategies: PropTypes.array.isRequired,
        configuredStrategies: PropTypes.array.isRequired,
        featureToggleName: PropTypes.string.isRequired,
        updateStrategy: PropTypes.func,
        removeStrategy: PropTypes.func,
        moveStrategy: PropTypes.func,
        editable: PropTypes.bool,
    };

    constructor(props) {
        super();
        // temporal hack, until strategies get UIDs
        this.state = { keys: randomKeys(props.configuredStrategies.length) };
    }

    moveStrategy = async (index, toIndex) => {
        await this.props.moveStrategy(index, toIndex);
        this.setState({ keys: randomKeys(this.props.configuredStrategies.length) });
    };
    removeStrategy = async index => {
        await this.props.removeStrategy(index);
        this.setState({ keys: randomKeys(this.props.configuredStrategies.length) });
    };

    componentDidUpdate(props) {
        const { keys } = this.state;
        if (keys.length < props.configuredStrategies.length) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ keys: randomKeys(props.configuredStrategies.length) });
        }
    }

    render() {
        const { strategies, configuredStrategies, updateStrategy, featureToggleName, editable } = this.props;

        const { keys } = this.state;
        if (!configuredStrategies || configuredStrategies.length === 0) {
            return (
                <p style={{ padding: '0 16px' }}>
                    <i>No activation strategies selected.</i>
                </p>
            );
        }

        const blocks = configuredStrategies.map((strategy, i) => (
            <ConfigureStrategy
                index={i}
                key={`${keys[i]}}`}
                featureToggleName={featureToggleName}
                strategy={strategy}
                moveStrategy={this.moveStrategy}
                removeStrategy={this.removeStrategy.bind(this, i)}
                updateStrategy={updateStrategy ? updateStrategy.bind(null, i) : null}
                strategyDefinition={strategies.find(s => s.name === strategy.name)}
                editable={editable}
            />
        ));
        return (
            <DndProvider backend={HTML5Backend}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>{blocks}</div>
            </DndProvider>
        );
    }
}

export default StrategiesList;
