import React, { PropTypes } from 'react';

export default class ShowUserComponent extends React.Component {
    static propTypes () {
        return {
            user: PropTypes.object.isRequired,
            openEdit: PropTypes.func.isRequired,
        };
    }

    openEdit = (evt) => {
        evt.preventDefault();
        this.props.openEdit();
    }

    render () {
        return (
            <a className="mdl-navigation__link" href="#edit-user" onClick={this.openEdit} style={{}}>
                Username:&nbsp;
                <strong>{this.props.user.userName || 'Unknown'}</strong>
            </a>
        );
    }
}
