import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { MoveListItem, useDragItem } from 'hooks/useDragItem';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyItem } from './StrategyItem/StrategyItem';

interface IStrategyDraggableItemProps {
    strategy: IFeatureStrategy;
    environmentName: string;
    index: number;
    otherEnvironments?: IFeatureEnvironment['name'][];
    onDragAndDrop: MoveListItem;
}

const StyledIndexLabel = styled('div')(({ theme }) => ({
    fontSize: theme.typography.fontSize,
    color: theme.palette.text.secondary,
    position: 'absolute',
    display: 'none',
    right: 'calc(100% + 6px)',
    top: theme.spacing(2.5),
    [theme.breakpoints.up('md')]: {
        display: 'block',
    },
}));

export const StrategyDraggableItem = ({
    strategy,
    index,
    environmentName,
    otherEnvironments,
    onDragAndDrop,
}: IStrategyDraggableItemProps) => {
    const ref = useDragItem(index, onDragAndDrop);

    return (
        <Box key={strategy.id} ref={ref}>
            <ConditionallyRender
                condition={index > 0}
                show={<StrategySeparator text="OR" />}
            />
            <Box sx={{ position: 'relative' }}>
                <StyledIndexLabel>{index + 1}</StyledIndexLabel>
                <StrategyItem
                    strategy={strategy}
                    environmentId={environmentName}
                    otherEnvironments={otherEnvironments}
                    isDraggable
                />
            </Box>
        </Box>
    );
};
