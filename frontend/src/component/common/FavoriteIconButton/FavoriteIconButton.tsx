import React, { VFC } from 'react';
import { IconButton, SxProps, Theme, Tooltip } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';

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
                    <Tooltip title={'Remove from favorites'}>
                        <StarIcon
                            color="primary"
                            sx={{
                                fontSize: theme =>
                                    size === 'medium'
                                        ? theme.spacing(2)
                                        : theme.spacing(3),
                            }}
                        />
                    </Tooltip>
                }
                elseShow={
                    <Tooltip title={'Add to favorites'}>
                        <StarBorderIcon
                            sx={{
                                fontSize: theme =>
                                    size === 'medium'
                                        ? theme.spacing(2)
                                        : theme.spacing(3),
                            }}
                        />
                    </Tooltip>
                }
            />
        </IconButton>
    );
};
