import type { FC } from 'react';
import { styled } from '@mui/material';
import type { ProjectSchema, ProjectSchemaOwners } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { AvatarGroup } from 'component/common/AvatarGroup/AvatarGroup';

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

const StyledUserName = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    margin: theme.spacing(0, 0, 0.5, 0),
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap',
    alignSelf: 'end',
}));

const StyledContainer = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledHeader = styled('h3')(({ theme }) => ({
    margin: theme.spacing(0, 0, 1),
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
}));

const StyledWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5, 0, 2.5, 3),
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
}));

export const ProjectOwners: FC<IProjectOwnersProps> = ({ owners = [] }) => {
    const ownersMap = useOwnersMap();
    const users = owners.map(ownersMap);

    return (
        <StyledWrapper>
            <StyledContainer>
                <StyledHeader>
                    {owners.length === 1 ? 'Owner' : 'Owners'}
                </StyledHeader>
                <AvatarGroup users={users} avatarLimit={8} />
            </StyledContainer>
            <ConditionallyRender
                condition={owners.length === 1}
                show={<StyledUserName>{users[0]?.name}</StyledUserName>}
                elseShow={<div />}
            />
        </StyledWrapper>
    );
};
