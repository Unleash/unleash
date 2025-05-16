import { styled } from '@mui/material';
import type { FC } from 'react';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

type AvatarCellProps = {
    row?: {
        original?: {
            createdBy?: {
                id?: number;
                name?: string;
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

const StyledSecondaryText = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(3),
    height: theme.spacing(3),
}));

export const AvatarCell =
    (onAvatarClick?: (userId: number) => void): FC<AvatarCellProps> =>
    ({ row }) => {
        const createdBy = {
            id: 0,
            name: '',
            imageUrl: '',
            ...row?.original?.createdBy,
        };
        const ariaDisabled = createdBy.id === 0;
        const clickAction = ariaDisabled
            ? () => {}
            : () => onAvatarClick?.(createdBy.id);
        const tooltipContent = ariaDisabled ? (
            <>
                <p>{createdBy.name}</p>
                <StyledSecondaryText>
                    You can't filter by unknown users.
                </StyledSecondaryText>
            </>
        ) : (
            <p>{createdBy.name}</p>
        );

        const content = (
            <>
                <ScreenReaderOnly>
                    <span>Show only flags created by {createdBy.name}</span>
                </ScreenReaderOnly>
                <StyledAvatar
                    disableTooltip
                    user={{
                        id: createdBy.id,
                        name: createdBy.name,
                        imageUrl: createdBy.imageUrl,
                    }}
                />
            </>
        );

        return (
            <StyledContainer>
                <HtmlTooltip arrow describeChild title={tooltipContent}>
                    {onAvatarClick ? (
                        <StyledAvatarButton
                            aria-disabled={ariaDisabled}
                            onClick={clickAction}
                        >
                            {content}
                        </StyledAvatarButton>
                    ) : (
                        <div>{content}</div>
                    )}
                </HtmlTooltip>
            </StyledContainer>
        );
    };
