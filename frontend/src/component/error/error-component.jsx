import React, { PropTypes } from 'react';

import { Snackbar, Icon } from 'react-mdl';

class ErrorComponent extends React.Component {
    static propTypes = {
        errors: PropTypes.array.isRequired,
        muteError: PropTypes.func.isRequired,
    }

    render () {
        const showError = this.props.errors.length > 0;
        const error = showError ? this.props.errors[0] : undefined;
        const muteError = () => this.props.muteError(error);
        return (
            <Snackbar
                action="Dismiss"
                active={showError}
                onActionClick={muteError}
                onTimeout={muteError}
                timeout={10000}
            >
                <Icon name="question_answer" /> {error}
            </Snackbar>
        );
    }
}

export default ErrorComponent;
