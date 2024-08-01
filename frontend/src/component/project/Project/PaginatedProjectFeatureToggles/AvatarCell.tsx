import { styled } from '@mui/material';
import type { FC } from 'react';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
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

const StyledSecondaryText = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(3),
    height: theme.spacing(3),
}));

export const AvatarCell =
    (onAvatarClick: (userId: number) => void): FC<AvatarCellProps> =>
    ({ row: { original } }) => {
        const ariaDisabled = original.createdBy.id === 0;
        const clickAction = ariaDisabled
            ? () => {}
            : () => onAvatarClick(original.createdBy.id);
        const tooltipContent = ariaDisabled ? (
            <>
                <p>{original.createdBy.name}</p>
                <StyledSecondaryText>
                    You can't filter by unknown users.
                </StyledSecondaryText>
            </>
        ) : (
            <p>{original.createdBy.name}</p>
        );

        return (
            <StyledContainer>
                <HtmlTooltip arrow describeChild title={tooltipContent}>
                    <StyledAvatarButton
                        aria-disabled={ariaDisabled}
                        onClick={clickAction}
                    >
                        <ScreenReaderOnly>
                            <span>
                                Show only flags created by{' '}
                                {original.createdBy.name}
                            </span>
                        </ScreenReaderOnly>

                        <StyledAvatar
                            disableTooltip
                            user={{
                                id: original.createdBy.id,
                                name: original.createdBy.name,
                                imageUrl: original.createdBy.imageUrl,
                            }}
                        />
                    </StyledAvatarButton>
                </HtmlTooltip>
            </StyledContainer>
        );
    };
