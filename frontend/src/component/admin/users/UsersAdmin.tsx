import { useContext, useState } from 'react';
import UsersList from './UsersList/UsersList';
import AdminMenu from '../menu/AdminMenu';
import { PageContent } from 'component/common/PageContent/PageContent';
import AccessContext from 'contexts/AccessContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { Button } from '@mui/material';
import { TableActions } from 'component/common/Table/TableActions/TableActions';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useStyles } from './UserAdmin.styles';
import { useNavigate } from 'react-router-dom';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';

const UsersAdmin = () => {
    const [search, setSearch] = useState('');
    const { hasAccess } = useContext(AccessContext);
    const navigate = useNavigate();
    const { classes: styles } = useStyles();

    return (
        <div>
            <AdminMenu />
            <PageContent
                bodyClass={styles.userListBody}
                header={
                    <PageHeader
                        title="Users"
                        actions={
                            <ConditionallyRender
                                condition={hasAccess(ADMIN)}
                                show={
                                    <div className={styles.tableActions}>
                                        <TableActions
                                            initialSearchValue={search}
                                            onSearch={search =>
                                                setSearch(search)
                                            }
                                        />
                                        <Button
                                            sx={{
                                                ml: 1.5,
                                            }}
                                            variant="contained"
                                            color="primary"
                                            onClick={() =>
                                                navigate('/admin/create-user')
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
                    elseShow={<AdminAlert />}
                />
            </PageContent>
        </div>
    );
};

export default UsersAdmin;
