import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import UsersList from './UsersList';
import AdminMenu from '../admin-menu';
import PageContent from '../../../component/common/PageContent/PageContent';
import AccessContext from '../../../contexts/AccessContext';
import ConditionallyRender from '../../../component/common/ConditionallyRender';
import { ADMIN } from '../../../component/providers/AccessProvider/permissions';
import { Alert } from '@material-ui/lab';
import HeaderTitle from '../../../component/common/HeaderTitle';
import { Button } from '@material-ui/core';
import { useStyles } from './index.styles';

const UsersAdmin = ({ history }) => {
    const { hasAccess } = useContext(AccessContext);
    const [showDialog, setDialog] = useState(false);
    const styles = useStyles();

    const openDialog = e => {
        e.preventDefault();
        setDialog(true);
    };

    const closeDialog = () => {
        setDialog(false);
    };

    return (
        <div>
            <AdminMenu history={history} />
            <PageContent
                bodyClass={styles.userListBody}
                headerContent={
                    <HeaderTitle
                        title="Users"
                        actions={
                            <ConditionallyRender
                                condition={hasAccess(ADMIN)}
                                show={
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() =>
                                            history.push('/admin/create-user')
                                        }
                                    >
                                        Add new user
                                    </Button>
                                }
                                elseShow={
                                    <small>
                                        PS! Only admins can add/remove users.
                                    </small>
                                }
                            />
                        }
                    />
                }
            >
                <ConditionallyRender
                    condition={hasAccess(ADMIN)}
                    show={
                        <UsersList
                            openDialog={openDialog}
                            closeDialog={closeDialog}
                            showDialog={showDialog}
                        />
                    }
                    elseShow={
                        <Alert severity="error">
                            You need instance admin to access this section.
                        </Alert>
                    }
                />
            </PageContent>
        </div>
    );
};

UsersAdmin.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default UsersAdmin;
