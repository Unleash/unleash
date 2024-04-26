import type { FC } from 'react';
import { styled } from '@mui/material';
import { GroupCardAvatars } from 'component/admin/groups/GroupsList/GroupCard/GroupCardAvatars/NewGroupCardAvatars';
import type { ProjectSchema, ProjectSchemaOwners } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IProjectOwnersProps {
    owners?: ProjectSchema['owners'];
}

const userOwnersMap = () => {
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
            name: 'System',
            imageUrl: `${uiConfig.unleashUrl}/logo-unleash.png`,
        };
    };
};

const StyledContainer = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

export const ProjectOwners: FC<IProjectOwnersProps> = ({ owners = [] }) => {
    const ownersMap = userOwnersMap();

    return (
        <StyledContainer>
            <GroupCardAvatars
                header={owners.length === 1 ? 'Owner' : 'Owners'}
                users={owners.map(ownersMap)}
            />
        </StyledContainer>
    );
};
