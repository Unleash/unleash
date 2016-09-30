import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Input, Switch, Button } from 'react-toolbox';
import { addFeatureToggle } from '../../store/actions';


class AddFeatureToggle extends React.Component {
    constructor () {
        super();
        this.state = { name: '', description: '', enabled: false };
    }

    static propTypes () {
        return {
            dispatch: PropTypes.func.isRequired,
        };
    }

    onSubmit = (evt) => {
        evt.preventDefault();
        this.props.dispatch(addFeatureToggle(this.state.name, this.state.enabled));
    };

    handleChange = (key, value) => {
        const change = {};
        change[name] = value;

        const newState = Object.assign({}, this.state, change);
        this.setState(newState);
    };

    render () {
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <Input
                        type="text"
                        label="Name"
                        name="name"
                        value={this.state.name}
                        onChange={this.handleChange.bind(this, 'name')} />
                    <Input
                        type="text"
                        multiline label="Description"
                        value={this.state.description}
                        onChange={this.handleChange.bind(this, 'description')} />

                    <br />

                    <Switch
                        checked={this.state.enabled}
                        label="Enabled"
                        onChange={this.handleChange.bind(this, 'enabled')} />

                    <br />
                    <Button type="submit"  raised primary>
                        Create Feature Toggle.
                    </Button>
                </form>
            </div>
        );
    }
}

export default connect()(AddFeatureToggle);
