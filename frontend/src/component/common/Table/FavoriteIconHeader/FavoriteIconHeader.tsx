import { useState, VFC } from 'react';
import { IconButton } from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TooltipResolver } from '../../TooltipResolver/TooltipResolver';

interface IFavoriteIconHeaderProps {
    isActive: boolean;
    onClick: (isPinned: boolean) => void;
}

export const FavoriteIconHeader: VFC<IFavoriteIconHeaderProps> = ({
    isActive = false,
    onClick,
}) => {
    const [internalState, setInternalState] = useState(isActive);
    const onToggle = () => {
        setInternalState(!internalState);
        onClick(!internalState);
    };

    return (
        <TooltipResolver
            title={
                internalState
                    ? 'Unpin favorite features from the top'
                    : 'Pin favorite features to the top'
            }
        >
            <IconButton
                sx={{
                    mx: -0.75,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 1.25,
                }}
                onClick={onToggle}
                size="small"
            >
                <ConditionallyRender
                    condition={internalState}
                    show={<StarIcon fontSize="small" />}
                    elseShow={<StarBorderIcon fontSize="small" />}
                />
            </IconButton>
        </TooltipResolver>
    );
};
