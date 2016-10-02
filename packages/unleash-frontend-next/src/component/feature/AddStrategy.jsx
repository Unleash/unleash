import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-toolbox';


class AddStrategy extends React.Component {
    constructor () {
        super();
        this.state = {
            name: '',
            parameters: {},
        };
    }

    static propTypes () {
        return {
            StrategyDefinitions: PropTypes.array.isRequired,
        };
    }

    static contextTypes = {
        router: React.PropTypes.object,
    }

    onSubmit = (evt) => {
        evt.preventDefault();
    };

    addStrategy = (evt) => {
        evt.preventDefault();
    }

    handleChange = (key, value) => {
        const change = {};
        change[key] = value;

        const newState = Object.assign({}, this.state, change);
        this.setState(newState);
    };

    render () {
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    New Strategy:
                    <Button type="submit" raised primary label="Create" />
                </form>
            </div>
        );
    }
}

export default connect()(AddStrategy);
