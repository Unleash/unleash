import React, { PropTypes } from 'react';
import Button from 'react-toolbox/lib/button';

class AddStrategiesToToggle extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            selectedStrategy: undefined,
        };
    }

    static propTypes () {
        return {
            addStrategy: PropTypes.func.isRequired,
            strategies: PropTypes.array.isRequired,
            fetchStrategies: PropTypes.func.isRequired,
        };
    }

    componentWillMount () {
        // TODO: move somewhere appropriate?
        this.props.fetchStrategies();
    }


    addStrategy = (strategy) => {
        this.setState({ selectedStrategy: undefined });
        this.props.addStrategy(strategy);
    }


    render () {
        const selectedStrategy = this.state.selectedStrategy || this.props.strategies[0];

        const strategies = this.props.strategies.map(s => (
            <option key={s.name} value={s.name}>{s.name}</option>
        ));

        return (
            <div>
                <select value={selectedStrategy.name} onChange={this.handleChange}>
                    {strategies}
                </select>
                <Button icon="add" accent onClick={this.showConfigure}>Add strategy</Button>
            </div>
        );
    }
}

export default AddStrategiesToToggle;
