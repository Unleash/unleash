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
    onClick: (e? : any) => void;
    isFavorite: boolean;
}

export const FavoriteIconButton: VFC<IFavoriteIconButtonProps> = ({
    onClick,
    isFavorite,
}) => {
    return (
        <IconButton
            size="large"
            data-loading
            sx={{ mr: 1 }}
            onClick={onClick}
        >
            <ConditionallyRender
                condition={isFavorite}
                show={<StarIcon color="primary" />}
                elseShow={<StarBorderIcon />}
            />
        </IconButton>
    );
};
