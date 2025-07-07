import { Route, Routes } from 'react-router-dom';
import { UG } from 'component/common/flags';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { GroupsList } from './GroupsList/GroupsList.tsx';
import { ADMIN } from '@server/types/permissions';
import { CreateGroup } from './CreateGroup/CreateGroup.tsx';
import { EditGroupContainer } from './EditGroup/EditGroup.tsx';
import { Group } from './Group/Group.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';

export const GroupsAdmin = () => {
    const { uiConfig, isEnterprise } = useUiConfig();

    if (isEnterprise() || uiConfig.flags[UG] === true) {
        return (
            <div>
                <PermissionGuard permissions={ADMIN}>
                    <Routes>
                        <Route index element={<GroupsList />} />
                        <Route path='create-group' element={<CreateGroup />} />
                        <Route
                            path=':groupId/edit'
                            element={<EditGroupContainer />}
                        />
                        <Route path=':groupId' element={<Group />} />
                    </Routes>
                </PermissionGuard>
            </div>
        );
    }

    return <PremiumFeature feature='groups' page />;
};
