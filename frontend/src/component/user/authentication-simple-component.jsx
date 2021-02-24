import React from 'react';
import PropTypes from 'prop-types';
import { CardActions, Button, Textfield } from 'react-mdl';

class SimpleAuthenticationComponent extends React.Component {
    static propTypes = {
        authDetails: PropTypes.object.isRequired,
        insecureLogin: PropTypes.func.isRequired,
        loadInitialData: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
    };

    handleSubmit = evt => {
        evt.preventDefault();
        const email = this.refs.email.inputRef.value;
        const user = { email };
        const path = evt.target.action;

        this.props
            .insecureLogin(path, user)
            .then(this.props.loadInitialData)
            .then(() => this.props.history.push(`/`));
    };

    render() {
        const authDetails = this.props.authDetails;
        return (
            <form onSubmit={this.handleSubmit} action={authDetails.path}>
                <p>{authDetails.message}</p>
                <p>
                    This instance of Unleash is not set up with a secure authentication provider. You can read more
                    about{' '}
                    <a href="https://github.com/Unleash/unleash/blob/master/docs/securing-unleash.md" target="_blank">
                        securing Unleash on GitHub
                    </a>
                </p>
                <Textfield label="Email" name="email" required type="email" ref="email" />
                <br />

                <CardActions style={{ textAlign: 'center' }}>
                    <Button raised colored>
                        Sign in
                    </Button>
                </CardActions>
            </form>
        );
    }
}

export default SimpleAuthenticationComponent;
