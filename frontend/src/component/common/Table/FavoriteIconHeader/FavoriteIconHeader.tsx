import { VFC } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IFavoriteIconHeaderProps {
    isActive: boolean;
    onClick: () => void;
}

export const FavoriteIconHeader: VFC<IFavoriteIconHeaderProps> = ({
    isActive = false,
    onClick,
}) => {
    return (
        <Tooltip
            title={
                isActive
                    ? 'Unpin favorite features from the top'
                    : 'Pin favorite features to the top'
            }
            placement="bottom-start"
        >
            <IconButton
                sx={{
                    mx: -0.75,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onClick={onClick}
                size="small"
            >
                <ConditionallyRender
                    condition={isActive}
                    show={<StarIcon fontSize="small" />}
                    elseShow={<StarBorderIcon fontSize="small" />}
                />
            </IconButton>
        </Tooltip>
    );
};
