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
    flexDirection: 'column',
}));

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    height: theme.spacing(3.5),
}));

const StyledUserName = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
    lineHeight: '1.2',
}));

const StyledHeader = styled('h3')(({ theme }) => ({
    width: '100%',
    margin: theme.spacing(0, 0, 1),
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
}));

export const ProjectOwners: FC<IProjectOwnersProps> = ({ owners = [] }) => {
    const ownersMap = useOwnersMap();
    const users = owners.map(ownersMap);

    return (
        <StyledContainer>
            <StyledHeader>
                {owners.length === 1 ? 'Owner' : 'Owners'}
            </StyledHeader>
            <StyledContent>
                <GroupCardAvatars users={users} />
                <ConditionallyRender
                    condition={owners.length === 1}
                    show={
                        <StyledUserName>
                            {users[0]?.name || users[0]?.description}
                        </StyledUserName>
                    }
                />
            </StyledContent>
        </StyledContainer>
    );
};
