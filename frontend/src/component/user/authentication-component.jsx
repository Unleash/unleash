import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, Icon, DialogTitle } from '@material-ui/core';
import SimpleAuth from './SimpleAuth/SimpleAuth';
import AuthenticationCustomComponent from './authentication-custom-component';
import AuthenticationPasswordComponent from './PasswordAuth/PasswordAuth';

const SIMPLE_TYPE = 'unsecure';
const PASSWORD_TYPE = 'password';

const customStyles = {};

class AuthComponent extends React.Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        insecureLogin: PropTypes.func.isRequired,
        passwordLogin: PropTypes.func.isRequired,
        loadInitialData: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
    };

    render() {
        const authDetails = this.props.user.authDetails;
        if (!authDetails) return null;

        let content;
        if (authDetails.type === PASSWORD_TYPE) {
            content = (
                <AuthenticationPasswordComponent
                    passwordLogin={this.props.passwordLogin}
                    authDetails={authDetails}
                    loadInitialData={this.props.loadInitialData}
                    history={this.props.history}
                />
            );
        } else if (authDetails.type === SIMPLE_TYPE) {
            content = (
                <SimpleAuth
                    insecureLogin={this.props.insecureLogin}
                    authDetails={authDetails}
                    loadInitialData={this.props.loadInitialData}
                    history={this.props.history}
                />
            );
        } else {
            content = <AuthenticationCustomComponent authDetails={authDetails} />;
        }
        return (
            <div>
                <Dialog open={this.props.user.showDialog} style={customStyles}>
                    <DialogTitle
                        id="simple-dialog-title"
                        style={{
                            background: 'rgb(96, 125, 139)',
                            color: '#fff',
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <Icon style={{ marginRight: '8px' }}>person</Icon> Login
                        </span>
                    </DialogTitle>

                    <div style={{ padding: '1rem' }}>{content}</div>
                </Dialog>
            </div>
        );
    }
}

export default AuthComponent;
