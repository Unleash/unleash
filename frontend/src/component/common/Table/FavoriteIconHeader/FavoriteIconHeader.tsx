import { useState, type VFC } from 'react';
import { IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TooltipResolver } from '../../TooltipResolver/TooltipResolver.tsx';

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
                    my: -1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 1.25,
                }}
                onClick={onToggle}
                size='small'
            >
                <ConditionallyRender
                    condition={internalState}
                    show={<StarIcon fontSize='small' />}
                    elseShow={<StarBorderIcon fontSize='small' />}
                />
            </IconButton>
        </TooltipResolver>
    );
};
