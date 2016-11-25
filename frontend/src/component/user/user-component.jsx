import React, { PropTypes } from 'react';
import Dialog from 'react-toolbox/lib/dialog';
import Input from 'react-toolbox/lib/input';

class EditUserComponent extends React.Component {
    static propTypes () {
        return {
            user: PropTypes.object.isRequired,
            updateUserName: PropTypes.func.isRequired,
        };
    }

    handleSubmit = (evt) => {
        evt.preventDefault();
        this.props.save();
    }

    render () {
        const actions = [
            { label: 'Save', onClick: this.props.save },
        ];

        return (
            <Dialog
                active={this.props.user.showDialog}
                title="Action required"
                actions={actions}
            >

                <p>
                    You hav to specify a username to use Unleash. This will allow us to track changes.
                </p>
                <form onSubmit={this.handleSubmit}>
                    <Input
                        type="text"
                        label="USERNAME"
                        name="username"
                        required
                        value={this.props.user.userName}
                        onChange={(v) => this.props.updateUserName(v)}
                    />
                </form>
            </Dialog>
        );
    }
}

export default EditUserComponent;
