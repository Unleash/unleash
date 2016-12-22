import React, { PropTypes } from 'react';
import { Textfield, Button } from 'react-mdl';
import Modal from 'react-modal';

const customStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 99999,
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#FFFFFF',
    },
};

class EditUserComponent extends React.Component {
    static propTypes () {
        return {
            user: PropTypes.object.isRequired,
            updateUserName: PropTypes.func.isRequired,
            save: PropTypes.func.isRequired,
        };
    }

    handleSubmit = (evt) => {
        evt.preventDefault();
        this.props.save();
    }

    render () {
        return (
            <div>
                <Modal
                    isOpen={this.props.user.showDialog}
                    contentLabel="test"
                    style={customStyles} >
                    <h2>Action required</h2>
                    <div>
                        <p>
                            You hav to specify a username to use Unleash. This will allow us to track changes.
                        </p>
                        <form onSubmit={this.handleSubmit}>
                            <Textfield
                                label="Username"
                                name="username"
                                required
                                value={this.props.user.userName}
                                onChange={(e) => this.props.updateUserName(e.target.value)}
                            />
                            <br />
                            <Button raised accent onClick={this.props.save}>Save</Button>
                        </form>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default EditUserComponent;
