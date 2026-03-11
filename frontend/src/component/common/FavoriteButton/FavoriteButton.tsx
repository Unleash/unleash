import type { FC } from 'react';
import { IconButton, styled } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const StyledButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
    color: theme.palette.primary.main,
    padding: 0,
    fontSize: '0.875rem',
    opacity: active ? 1 : 0,
    '&:hover': { opacity: 1 },
    '&:focus': { opacity: 1 },
    '&:active': { opacity: 1 },
}));

interface FavoriteButtonProps {
    isFavorite: boolean;
    onClick: () => void;
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({
    isFavorite,
    onClick,
}) => {
    const favoriteProps = isFavorite
        ? { 'aria-label': 'Remove from favorites' }
        : { 'aria-label': 'Add to favorites', className: 'show-row-hover' };

    return (
        <StyledButton
            active={isFavorite}
            size='small'
            {...favoriteProps}
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
        >
            {isFavorite ? (
                <StarIcon sx={{ fontSize: 'inherit' }} />
            ) : (
                <StarBorderIcon sx={{ fontSize: 'inherit' }} />
            )}
        </StyledButton>
    );
};
