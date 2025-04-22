import { styled } from '@mui/material';
import {
    AvatarComponent,
    AvatarGroup,
} from 'component/common/AvatarGroup/AvatarGroup';
import type { Collaborator } from 'interfaces/featureToggle';
import type { FC } from 'react';

const StyledAvatarComponent = styled(AvatarComponent)(({ theme }) => ({
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
}));

const StyledAvatarGroup = styled(AvatarGroup)({
    flexWrap: 'nowrap',
});

type CollaboratorsProps = {
    collaborators: Collaborator[] | undefined;
};

export const Collaborators: FC<CollaboratorsProps> = ({ collaborators }) => {
    if (!collaborators || collaborators.length === 0) {
        return null;
    }

    return (
        <StyledAvatarGroup
            users={collaborators}
            avatarLimit={9}
            AvatarComponent={StyledAvatarComponent}
        />
    );
};
