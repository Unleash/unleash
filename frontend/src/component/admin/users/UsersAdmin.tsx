import { useContext, useState } from 'react';
import UsersList from './UsersList/UsersList';
import AdminMenu from '../menu/AdminMenu';
import PageContent from 'component/common/PageContent/PageContent';
import AccessContext from 'contexts/AccessContext';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { Alert } from '@material-ui/lab';
import HeaderTitle from 'component/common/HeaderTitle';
import { TableActions } from 'component/common/Table/TableActions/TableActions';
import { Button } from '@material-ui/core';
import { useStyles } from './UserAdmin.styles';
import { useHistory } from 'react-router-dom';

const UsersAdmin = () => {
    const [search, setSearch] = useState('');
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
                                    <div className={styles.tableActions}>
                                        <TableActions
                                            search={search}
                                            onSearch={search =>
                                                setSearch(search)
                                            }
                                        />
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() =>
                                                history.push(
                                                    '/admin/create-user'
                                                )
                                            }
                                        >
                                            New user
                                        </Button>
                                    </div>
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
                    show={<UsersList search={search} />}
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
