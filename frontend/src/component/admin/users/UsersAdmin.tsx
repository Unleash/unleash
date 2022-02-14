import { useContext } from 'react';
import UsersList from './UsersList/UsersList';
import AdminMenu from '../menu/AdminMenu';
import PageContent from '../../common/PageContent/PageContent';
import AccessContext from '../../../contexts/AccessContext';
import ConditionallyRender from '../../common/ConditionallyRender';
import { ADMIN } from '../../providers/AccessProvider/permissions';
import { Alert } from '@material-ui/lab';
import HeaderTitle from '../../common/HeaderTitle';
import { Button } from '@material-ui/core';
import { useStyles } from './UserAdmin.styles';
import { useHistory } from 'react-router-dom';

const UsersAdmin = () => {
    const { hasAccess } = useContext(AccessContext);
    const history = useHistory();
    const styles = useStyles();

    return (
        <div>
            <AdminMenu />
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
                    show={<UsersList />}
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

export default UsersAdmin;
