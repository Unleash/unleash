import type { FC } from 'react';
import { styled } from '@mui/material';
import type { ProjectSchema, ProjectSchemaOwners } from 'openapi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { AvatarComponent } from 'component/common/AvatarGroup/AvatarGroup';
import { AvatarGroupFromOwners } from 'component/common/AvatarGroupFromOwners/AvatarGroupFromOwners';

export interface IProjectOwnersProps {
    owners?: ProjectSchema['owners'];
}

const StyledUserName = styled('span')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
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

const AvatarHeight = 3.5;
const StyledWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    minHeight: theme.spacing(AvatarHeight),
}));

const StyledAvatarComponent = styled(AvatarComponent)(({ theme }) => ({
    cursor: 'default',
    height: theme.spacing(AvatarHeight),
}));

const getOwnerName = (owner?: ProjectSchemaOwners[number]) => {
    switch (owner?.ownerType) {
        case 'user':
        case 'group':
            return owner.name;
        default:
            return 'System';
    }
};

export const ProjectOwners: FC<IProjectOwnersProps> = ({ owners = [] }) => {
    return (
        <StyledWrapper data-testid='test'>
            <StyledContainer data-loading>
                <AvatarGroupFromOwners
                    users={owners}
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
                            {getOwnerName(owners[0])}
                        </StyledUserName>
                    </StyledOwnerName>
                }
            />
        </StyledWrapper>
    );
};
