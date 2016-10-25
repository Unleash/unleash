import React, { PropTypes } from 'react';
import { Button } from 'react-toolbox';

class AddStrategy extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            selectedStrategy: props.strategies[0],
        };
    }

    static propTypes () {
        return {
            strategies: PropTypes.array.isRequired,
            addStrategy: PropTypes.func.isRequired,
            fetchStrategies: PropTypes.func.isRequired,
        };
    }

    componentWillReceiveProps (nextProps) {
        // this will fix async strategies list loading after mounted
        if (!this.state.selectedStrategy && nextProps.strategies.length > 0) {
            this.setState({ selectedStrategy: nextProps.strategies[0] });
        }
    }

    handleChange = (evt) => {
        const strategyName = evt.target.value;
        const selectedStrategy = this.props.strategies.find(s => s.name === strategyName);
        this.setState({ selectedStrategy });
    }

    addStrategy = (evt) => {
        evt.preventDefault();
        const selectedStrategy =  this.state.selectedStrategy;
        const parameters = {};
        const keys = Object.keys(selectedStrategy.parametersTemplate || {});
        keys.forEach(prop => { parameters[prop] = ''; });


        this.props.addStrategy({
            name: selectedStrategy.name,
            parameters,
        });
    };

    render () {
        const strategies = this.props.strategies.map(s => (
            <option key={s.name} value={s.name}>{s.name}</option>
        ));

        const selectedStrategy = this.state.selectedStrategy || this.props.strategies[0];

        if (!selectedStrategy) {
            return <i>Strategies loading...</i>;
        }

        return (
            <div>
                <select value={selectedStrategy.name} onChange={this.handleChange}>
                    {strategies}
                </select>
                <Button icon="add" accent flat label="add strategy" onClick={this.addStrategy} />
                <p><strong>Description:</strong> {selectedStrategy.description}</p>
            </div>
        );
    }
}

export default AddStrategy;
