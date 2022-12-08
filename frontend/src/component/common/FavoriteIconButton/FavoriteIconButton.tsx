import React, { VFC } from 'react';
import { IconButton, SxProps, Theme } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { TooltipResolver } from '../TooltipResolver/TooltipResolver';

interface IFavoriteIconButtonProps {
    onClick: (event?: any) => void;
    isFavorite: boolean;
    size?: 'medium' | 'large';
    sx?: SxProps<Theme>;
}

export const FavoriteIconButton: VFC<IFavoriteIconButtonProps> = ({
    onClick,
    isFavorite,
    size = 'large',
    sx,
}) => {
    return (
        <IconButton
            size={size}
            data-loading
            sx={{ mr: 1, ...sx }}
            onClick={onClick}
        >
            <ConditionallyRender
                condition={isFavorite}
                show={
                    <TooltipResolver title={'Remove from favorites'}>
                        <StarIcon
                            color="primary"
                            sx={{
                                fontSize: theme =>
                                    size === 'medium'
                                        ? theme.spacing(2)
                                        : theme.spacing(3),
                            }}
                        />
                    </TooltipResolver>
                }
                elseShow={
                    <TooltipResolver title={'Add to favorites'}>
                        <StarBorderIcon
                            sx={{
                                fontSize: theme =>
                                    size === 'medium'
                                        ? theme.spacing(2)
                                        : theme.spacing(3),
                            }}
                        />
                    </TooltipResolver>
                }
            />
        </IconButton>
    );
};
