import React, { PropTypes } from 'react';
import { Textfield, Dialog, DialogTitle, DialogContent, DialogActions, Button } from 'react-mdl';

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
        return (
            <div>
                <Dialog open={this.props.user.showDialog}>
                    <DialogTitle>Action required</DialogTitle>
                    <DialogContent>
                        <p>
                            You are logged in as:You hav to specify a username to use Unleash. This will allow us to track changes.
                        </p>
                        <form onSubmit={this.handleSubmit}>
                            <Textfield
                                label="USERNAME"
                                name="username"
                                required
                                value={this.props.user.userName}
                                onChange={(e) => this.props.updateUserName(e.target.value)}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.props.save}>Save</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default EditUserComponent;
