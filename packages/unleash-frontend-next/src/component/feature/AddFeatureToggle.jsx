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

    static contextTypes = {
        router: React.PropTypes.object,
    }

    onSubmit = (evt) => {
        evt.preventDefault();
        this.props.dispatch(addFeatureToggle(this.state.name));
        this.context.router.push('/features');
    };

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
                    <section>
                        <Input
                            type="text"
                            label="Name"
                            name="name"
                            required
                            value={this.state.name}
                            onChange={this.handleChange.bind(this, 'name')} />
                        <Input
                            type="text"
                            multiline label="Description"
                            required
                            value={this.state.description}
                            onChange={this.handleChange.bind(this, 'description')} />

                        <br />

                        <Switch
                            checked={this.state.enabled}
                            label="Enabled"
                            onChange={this.handleChange.bind(this, 'enabled')} />

                        <br />
                    </section>

                    <section>
                        <a href="#" onClick="">Add strategy..</a>
                    </section>

                    <br />


                    <Button type="submit" raised primary label="Create" />
                </form>
            </div>
        );
    }
}

export default connect()(AddFeatureToggle);
