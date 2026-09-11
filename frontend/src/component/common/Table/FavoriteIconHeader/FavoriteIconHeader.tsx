import { useState, type FC } from 'react';
import { IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TooltipResolver } from '../../TooltipResolver/TooltipResolver.tsx';
import { useTracking } from 'hooks/useTracking';
import type { Tracking } from 'utils/trackingEvents';

const favoritesPinnedTracking: Tracking = {
    event: 'favorite',
    type: 'favorites-pinned',
};

interface IFavoriteIconHeaderProps {
    isActive: boolean;
    onClick: (isPinned: boolean) => void;
    scope: 'global' | 'project';
}

export const FavoriteIconHeader: FC<IFavoriteIconHeaderProps> = ({
    isActive = false,
    onClick,
    scope,
}) => {
    const trackFavoritesPinned = useTracking(favoritesPinnedTracking);
    const [internalState, setInternalState] = useState(isActive);
    const onToggle = () => {
        const pinned = !internalState;
        setInternalState(pinned);
        trackFavoritesPinned('succeeded', {
            newState: pinned ? 'pinned' : 'unpinned',
            scope,
        });
        onClick(pinned);
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
                sx={(theme) => ({
                    mx: -0.75,
                    my: -1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 1.25,
                    color: theme.palette.primary.main,
                })}
                onClick={onToggle}
                size='small'
            >
                <ConditionallyRender
                    condition={internalState}
                    show={<StarIcon />}
                    elseShow={<StarBorderIcon />}
                />
            </IconButton>
        </TooltipResolver>
    );
};
