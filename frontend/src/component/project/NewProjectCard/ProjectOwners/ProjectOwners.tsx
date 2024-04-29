import type { FC } from 'react';
import { styled } from '@mui/material';
import { GroupCardAvatars } from 'component/admin/groups/GroupsList/GroupCard/GroupCardAvatars/NewGroupCardAvatars';
import type { ProjectSchema, ProjectSchemaOwners } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IProjectOwnersProps {
    owners?: ProjectSchema['owners'];
}

const useOwnersMap = () => {
    const { uiConfig } = useUiConfig();

    return (
        owner: ProjectSchemaOwners[0],
    ): {
        name: string;
        imageUrl?: string;
        email?: string;
        description?: string;
    } => {
        if (owner.ownerType === 'user') {
            return {
                name: owner.name,
                imageUrl: owner.imageUrl || undefined,
                email: owner.email || undefined,
            };
        }
        if (owner.ownerType === 'group') {
            return {
                name: owner.name || '',
                description: 'group',
            };
        }
        return {
            name: '',
            description: 'System',
            imageUrl: `${uiConfig.unleashUrl}/logo-unleash.png`,
        };
    };
};

const StyledContainer = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'flex-end',
}));

const StyledUserName = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    margin: theme.spacing(0, 0, 0.5, 0),
}));

export const ProjectOwners: FC<IProjectOwnersProps> = ({ owners = [] }) => {
    const ownersMap = useOwnersMap();
    const users = owners.map(ownersMap);

    return (
        <StyledContainer>
            <GroupCardAvatars
                header={owners.length === 1 ? 'Owner' : 'Owners'}
                users={users}
            />
            <ConditionallyRender
                condition={owners.length === 1}
                show={
                    <StyledUserName>
                        {users[0]?.name || users[0]?.description}
                    </StyledUserName>
                }
            />
        </StyledContainer>
    );
};
