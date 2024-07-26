import { styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { ReactNode } from 'react';
import { AvatarGroup } from 'component/common/AvatarGroup/AvatarGroup';

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

interface IGroupCardAvatarsProps {
    users: {
        name: string;
        description?: string;
        imageUrl?: string;
    }[];
    header?: ReactNode;
    avatarLimit?: number;
}

export const GroupCardAvatars = ({
    header,
    ...avatarGroupProps
}: IGroupCardAvatarsProps) => {
    return (
        <StyledContainer>
            <ConditionallyRender
                condition={typeof header === 'string'}
                show={<StyledHeader>{header}</StyledHeader>}
                elseShow={header}
            />
            <AvatarGroup {...avatarGroupProps} />
        </StyledContainer>
    );
};
