import React, { PropTypes } from 'react';
import SelectStrategies from './select-strategies';

class AddStrategiesToToggle extends React.Component {
    constructor () {
        super();
        this.state = {
            showConfigure: false,
        };
    }

    static propTypes () {
        return {
            strategies: PropTypes.array.isRequired,
            addStrategy: PropTypes.func.isRequired,
        };
    }

    cancelConfig = () => {
        this.setState({ showConfigure: false });
    };

    addStrategy = (strategy) => {
        this.setState({ showConfigure: false });
        this.props.addStrategy(strategy);
    }

    showConfigure = (evt) => {
        evt.preventDefault();
        this.setState({ showConfigure: true });
    }

    renderAddLink () {
        return (
            <div>
                <a href="#" onClick={this.showConfigure}>Add strategy</a>
            </div>
        );
    }

    render () {
        return this.state.showConfigure ?
            <SelectStrategies
                strategies={this.props.strategies}
                cancelConfig={this.cancelConfig}
                addStrategy={this.addStrategy} /> :
            this.renderAddLink();
    }
}

export default AddStrategiesToToggle;
