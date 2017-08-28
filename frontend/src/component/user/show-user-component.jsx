import React, { PropTypes } from 'react';
import { Icon, Tooltip } from 'react-mdl';

export default class ShowUserComponent extends React.Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        openEdit: PropTypes.func.isRequired,
    };

    openEdit = evt => {
        evt.preventDefault();
        this.props.openEdit();
    };

    render() {
        return (
            <a
                className="mdl-navigation__link"
                href="#edit-user"
                onClick={this.openEdit}
            >
                <Tooltip label={this.props.user.userName || 'Unknown'} large>
                    <Icon name="account_circle" />
                </Tooltip>
            </a>
        );
    }
}
