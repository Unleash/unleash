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
            <div style={{ textAlign: 'right' }}>
                <p>
                    You are logged in as:
                    <strong> <a href="#edit-user" onClick={this.openEdit}>{this.props.user.userName || 'unknown'}</a></strong>
                </p>
            </div>
        );
    }
}
