import type { FC } from 'react';
import { styled } from '@mui/material';
import type { ProjectSchema, ProjectSchemaOwners } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    AvatarGroup,
    AvatarComponent,
} from 'component/common/AvatarGroup/AvatarGroup';

export interface IProjectOwnersProps {
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
                name: owner.name,
            };
        }
        return {
            name: 'System',
            imageUrl: `${uiConfig.unleashUrl}/logo-unleash.png`,
        };
    };
};

const StyledUserName = styled('span')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    alignSelf: 'end',
    lineHeight: 1,
    lineClamp: `1`,
    WebkitLineClamp: 1,
    display: '-webkit-box',
    boxOrient: 'vertical',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    alignItems: 'flex-start',
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word',
    maxWidth: '100%',
}));

const StyledContainer = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '50%',
}));

const StyledOwnerName = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    margin: theme.spacing(0, 0, 0, 1),
}));

const StyledHeader = styled('span')(({ theme }) => ({
    lineHeight: 1,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: 'auto',
}));

const StyledWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5, 0, 1.5, 2),
    display: 'flex',
    alignItems: 'center',
}));

const StyledAvatarComponent = styled(AvatarComponent)(({ theme }) => ({
    cursor: 'default',
}));

export const ProjectOwners: FC<IProjectOwnersProps> = ({ owners = [] }) => {
    const ownersMap = useOwnersMap();
    const users = owners.map(ownersMap);

    return (
        <StyledWrapper data-testid='test'>
            <StyledContainer data-loading>
                <AvatarGroup
                    users={users}
                    avatarLimit={6}
                    AvatarComponent={StyledAvatarComponent}
                />
            </StyledContainer>
            <ConditionallyRender
                condition={owners.length === 1}
                show={
                    <StyledOwnerName>
                        <StyledHeader data-loading>Owner</StyledHeader>
                        <StyledUserName data-loading>
                            {users[0]?.name}
                        </StyledUserName>
                    </StyledOwnerName>
                }
            />
        </StyledWrapper>
    );
};
