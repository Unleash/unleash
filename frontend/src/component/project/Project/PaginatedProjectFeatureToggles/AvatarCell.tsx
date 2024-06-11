import { type Theme, styled } from '@mui/material';
import type { FC } from 'react';
import { visuallyHiddenStyles } from '../CreateProject/NewCreateProjectForm/ConfigButtons/shared.styles';
import { SrOnly } from 'component/common/SrOnly/SrOnly';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

type AvatarCellProps = {
    row: {
        original: {
            createdBy: {
                id: number;
                name: string;
                imageUrl?: string;
            };
        };
    };
};

const StyledContainer = styled('div')({
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

const StyledAvatarButton = styled('button')({
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    borderRadius: '100%',
    padding: 0,
});

export const VisuallyHiddenButtonText = styled('span')(() => ({
    ...visuallyHiddenStyles,
    position: 'absolute',
}));

export const AvatarCell =
    (onAvatarClick: (userId: number) => void): FC<AvatarCellProps> =>
    ({ row: { original } }) => {
        return (
            <StyledContainer>
                <HtmlTooltip
                    arrow
                    describeChild
                    title={original.createdBy.name}
                >
                    <StyledAvatarButton
                        onClick={() => onAvatarClick(original.createdBy.id)}
                    >
                        <SrOnly>
                            <span>
                                Show only flags created by{' '}
                                {original.createdBy.name}
                            </span>
                        </SrOnly>

                        <UserAvatar
                            user={{
                                id: original.createdBy.id,
                                name: original.createdBy.name,
                                imageUrl: original.createdBy.imageUrl,
                            }}
                            avatarWidth={(theme: Theme) => theme.spacing(3)}
                        />
                    </StyledAvatarButton>
                </HtmlTooltip>
            </StyledContainer>
        );
    };
