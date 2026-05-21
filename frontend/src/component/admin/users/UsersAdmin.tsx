import UsersList from './UsersList/UsersList.tsx';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { Route, Routes } from 'react-router-dom';
import EditUser from './EditUser/EditUser.tsx';
import NotFound from 'component/common/NotFound/NotFound';
import { InactiveUsersList } from './InactiveUsersList/InactiveUsersList.tsx';
import { AccessOverview } from './AccessOverview/AccessOverview.tsx';
import { PremiumFeature } from '../../common/PremiumFeature/PremiumFeature.tsx';
import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { NewAccessOverview } from './AccessOverview/NewAccessOverview.tsx';

export const UsersAdmin = () => {
    const { isEnterprise } = useUiConfig();
    const accessOverviewReworkEnabled = useUiFlag('accessOverviewRework');
    return (
        <div>
            <PermissionGuard permissions={ADMIN}>
                <Routes>
                    <Route
                        index
                        element={
                            <>
                                <UsersList />
                            </>
                        }
                    />
                    <Route path=':id/edit' element={<EditUser />} />
                    <Route
                        path=':id/access'
                        element={
                            <ConditionallyRender
                                condition={Boolean(accessOverviewReworkEnabled)}
                                show={<NewAccessOverview />}
                                elseShow={<AccessOverview />}
                            />
                        }
                    />
                    <Route
                        path='inactive'
                        element={
                            <ConditionallyRender
                                condition={isEnterprise()}
                                show={<InactiveUsersList />}
                                elseShow={
                                    <PremiumFeature
                                        feature='inactive-users'
                                        page
                                    />
                                }
                            />
                        }
                    />
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </PermissionGuard>
        </div>
    );
};

export default UsersAdmin;
