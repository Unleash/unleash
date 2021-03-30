import React from 'react';
import PropTypes from 'prop-types';
import { CardActions, Button } from '@material-ui/core';

class AuthenticationCustomComponent extends React.Component {
    static propTypes = {
        authDetails: PropTypes.object.isRequired,
    };

    render() {
        const authDetails = this.props.authDetails;
        return (
            <div>
                <p>{authDetails.message}</p>
                <CardActions style={{ textAlign: 'center' }}>
                    <a href={authDetails.path}>
                        <Button raised colored>
                            Sign In
                        </Button>
                    </a>
                </CardActions>
            </div>
        );
    }
}

export default AuthenticationCustomComponent;
