import React, { VFC } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { IconButton } from '@mui/material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';

interface IFavoriteIconButtonProps {
    onClick: (event?: any) => void;
    isFavorite: boolean;
    size?: 'medium' | 'large';
}

export const FavoriteIconButton: VFC<IFavoriteIconButtonProps> = ({
    onClick,
    isFavorite,
    size = 'large',
}) => {
    return (
        <IconButton size={size} data-loading sx={{ mr: 1 }} onClick={onClick}>
            <ConditionallyRender
                condition={isFavorite}
                show={
                    <StarIcon
                        color="primary"
                        sx={{
                            fontSize: theme =>
                                size === 'medium'
                                    ? theme.spacing(2)
                                    : theme.spacing(3),
                        }}
                    />
                }
                elseShow={
                    <StarBorderIcon
                        sx={{
                            fontSize: theme =>
                                size === 'medium'
                                    ? theme.spacing(2)
                                    : theme.spacing(3),
                        }}
                    />
                }
            />
        </IconButton>
    );
};
