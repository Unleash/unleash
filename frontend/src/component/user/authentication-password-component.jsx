import React from 'react';
import PropTypes from 'prop-types';
import { CardActions, Button, Textfield } from 'react-mdl';

class EnterpriseAuthenticationComponent extends React.Component {
    static propTypes = {
        authDetails: PropTypes.object.isRequired,
        passwordLogin: PropTypes.func.isRequired,
        fetchFeatureToggles: PropTypes.func.isRequired,
        fetchUIConfig: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {};
    }

    onShowOptions = e => {
        e.preventDefault();
        this.setState({ showFields: true });
    };

    handleSubmit = async evt => {
        evt.preventDefault();
        const { username, password } = this.state;

        if (!username) {
            this.setState({ usernameError: 'This is a required field' });
            return;
        }
        if (!password) {
            this.setState({ passwordError: 'This is a required field' });
            return;
        }
        const user = { username, password };
        const path = evt.target.action;

        try {
            await this.props.passwordLogin(path, user);
            await this.props.fetchFeatureToggles();
            await this.props.fetchUIConfig();
            this.props.history.push(`/`);
        } catch (error) {
            if (error.statusCode === 404) {
                this.setState({ error: 'User not found', password: '' });
            } else if (error.statusCode === 400) {
                this.setState({ error: 'Wrong password', password: '' });
            } else {
                this.setState({ error: 'Could not sign in at the moment.' });
            }
        }
    };

    renderLoginForm() {
        const authDetails = this.props.authDetails;
        const { username, usernameError, password, passwordError, error } = this.state;
        return (
            <form onSubmit={this.handleSubmit} action={authDetails.path}>
                <p>{authDetails.message}</p>
                <p style={{ color: 'red' }}>{error}</p>
                <Textfield
                    label="Username or email"
                    floatingLabel
                    name="username"
                    type="string"
                    onChange={evt => this.setState({ username: evt.target.value })}
                    value={username}
                    error={usernameError}
                />
                <Textfield
                    label="Password"
                    onChange={evt => this.setState({ password: evt.target.value })}
                    floatingLabel
                    name="password"
                    type="password"
                    value={password}
                    error={passwordError}
                />
                <br />

                <CardActions style={{ textAlign: 'center' }}>
                    <Button raised colored>
                        Sign in
                    </Button>
                </CardActions>
            </form>
        );
    }

    renderWithOptions(options) {
        return (
            <div style={{ textAlign: 'center' }}>
                {options.map(o => (
                    <CardActions key={o.type}>
                        <Button raised accent href={o.path}>
                            {o.value}
                        </Button>
                    </CardActions>
                ))}
                {this.state.showFields ? (
                    this.renderLoginForm()
                ) : (
                    <a href="" onClick={this.onShowOptions}>
                        Show more options
                    </a>
                )}
            </div>
        );
    }

    render() {
        const { options = [] } = this.props.authDetails;
        if (options.length > 0) {
            return this.renderWithOptions(options);
        }
        return this.renderLoginForm();
    }
}

export default EnterpriseAuthenticationComponent;
