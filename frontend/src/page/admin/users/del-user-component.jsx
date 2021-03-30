import React from 'react';
import Dialogue from '../../../component/common/Dialogue/Dialogue';
import ConditionallyRender from '../../../component/common/ConditionallyRender/ConditionallyRender';
import propTypes from 'prop-types';

const DelUserComponent = ({ showDialog, closeDialog, user, removeUser }) => (
    <ConditionallyRender
        condition={user}
        show={
            <Dialogue
                open={showDialog}
                title="Really delete user?"
                onClose={closeDialog}
                onClick={() => removeUser(user)}
                primaryButtonText="Delete user"
                secondaryButtonText="Cancel"
            >
                <div>
                    Are you sure you want to delete{' '}
                    {user ? `${user.name || 'user'} (${user.email || user.username})` : ''}?
                </div>
            </Dialogue>
        }
    />
);

DelUserComponent.propTypes = {
    showDialog: propTypes.bool.isRequired,
    closeDialog: propTypes.func.isRequired,
    user: propTypes.object.isRequired,
    removeUser: propTypes.func.isRequired,
};

export default DelUserComponent;
