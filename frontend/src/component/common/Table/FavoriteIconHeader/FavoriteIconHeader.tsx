import { useState, VFC } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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
        <Tooltip
            title={
                internalState
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
        </Tooltip>
    );
};
