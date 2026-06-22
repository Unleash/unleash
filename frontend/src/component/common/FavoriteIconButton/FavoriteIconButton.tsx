import type { FC } from 'react';
import { IconButton, type IconButtonProps } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { TooltipResolver } from '../TooltipResolver/TooltipResolver.tsx';

interface IFavoriteIconButtonProps extends IconButtonProps {
    isFavorite: boolean;
    size?: 'medium' | 'large';
}

export const FavoriteIconButton: FC<IFavoriteIconButtonProps> = ({
    isFavorite,
    size = 'large',
    ...props
}) => {
    return (
        <TooltipResolver
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            <IconButton size={size} data-loading {...props}>
                <ConditionallyRender
                    condition={isFavorite}
                    show={<StarIcon color='primary' />}
                    elseShow={<StarBorderIcon color='primary' />}
                />
            </IconButton>
        </TooltipResolver>
    );
};
