import {
    Box,
    Button,
    Card,
    Grid,
    Popover,
    styled,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
} from '@mui/material';
import Delete from '@mui/icons-material/DeleteOutlined';
import type {
    IReleasePlanMilestonePayload,
    IReleasePlanMilestoneStrategy,
} from 'interfaces/releasePlans';
import { type DragEventHandler, type RefObject, useState } from 'react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { MilestoneCardName } from './MilestoneCardName';
import { MilestoneStrategyMenuCards } from './MilestoneStrategyMenu/MilestoneStrategyMenuCards';
import { MilestoneStrategyDraggableItem } from './MilestoneStrategyDraggableItem';

const StyledMilestoneCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError: boolean }>(({ theme, hasError }) => ({
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'none',
    border: `1px solid ${hasError ? theme.palette.error.border : theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
    transition: 'background-color 0.2s ease-in-out',
    backgroundColor: theme.palette.background.default,
}));

const StyledMilestoneCardBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 2),
}));

const StyledGridItem = styled(Grid)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

const StyledAddStrategyButton = styled(Button)(({ theme }) => ({}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    marginTop: theme.spacing(2),
    boxShadow: 'none',
    background: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
    backgroundColor: theme.palette.background.default,
    '&:before': {
        opacity: '0 !important',
    },
    '&.Mui-expanded': { marginTop: `${theme.spacing(2)} !important` },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    boxShadow: 'none',
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadiusMedium,
    [theme.breakpoints.down(400)]: {
        padding: theme.spacing(1, 2),
    },
    '&.Mui-focusVisible': {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(0.5, 2, 0.3, 2),
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    borderBottomLeftRadius: theme.shape.borderRadiusMedium,
    borderBottomRightRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(0),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(2, 1),
    },
    backgroundColor: theme.palette.neutral.light,
}));

const StyledAccordionFooter = styled(Grid)(({ theme }) => ({
    padding: theme.spacing(2),
    paddingTop: 0,
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledMilestoneActionGrid = styled(Grid)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.main,
}));

interface IMilestoneCardProps {
    milestone: IReleasePlanMilestonePayload;
    milestoneChanged: (milestone: IReleasePlanMilestonePayload) => void;
    showAddStrategyDialog: (
        milestoneId: string,
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
        editing: boolean,
    ) => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
    removable: boolean;
    onDeleteMilestone: () => void;
}

export const MilestoneCard = ({
    milestone,
    milestoneChanged,
    showAddStrategyDialog,
    errors,
    clearErrors,
    removable,
    onDeleteMilestone,
}: IMilestoneCardProps) => {
    const [anchor, setAnchor] = useState<Element>();
    const [dragItem, setDragItem] = useState<{
        id: string;
        index: number;
        height: number;
    } | null>(null);
    const isPopoverOpen = Boolean(anchor);
    const popoverId = isPopoverOpen
        ? 'MilestoneStrategyMenuPopover'
        : undefined;

    const onClose = () => {
        setAnchor(undefined);
    };

    const onSelectEditStrategy = (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        showAddStrategyDialog(milestone.id, strategy, true);
    };

    const onSelectStrategy = (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        showAddStrategyDialog(milestone.id, strategy, false);
    };

    const onDragOver =
        (targetId: string) =>
        (
            ref: RefObject<HTMLDivElement>,
            targetIndex: number,
        ): DragEventHandler<HTMLDivElement> =>
        (event) => {
            if (dragItem === null || ref.current === null) return;
            if (dragItem.index === targetIndex || targetId === dragItem.id)
                return;

            const { top, bottom } = ref.current.getBoundingClientRect();
            const overTargetTop = event.clientY - top < dragItem.height;
            const overTargetBottom = bottom - event.clientY < dragItem.height;
            const draggingUp = dragItem.index > targetIndex;

            // prevent oscillating by only reordering if there is sufficient space
            if (
                (overTargetTop && draggingUp) ||
                (overTargetBottom && !draggingUp)
            ) {
                const oldStrategies = milestone.strategies || [];
                const newStrategies = [...oldStrategies];
                const movedStrategy = newStrategies.splice(
                    dragItem.index,
                    1,
                )[0];
                newStrategies.splice(targetIndex, 0, movedStrategy);
                milestoneChanged({ ...milestone, strategies: newStrategies });
                setDragItem({
                    ...dragItem,
                    index: targetIndex,
                });
            }
        };

    const onDragStartRef =
        (
            ref: RefObject<HTMLDivElement>,
            index: number,
        ): DragEventHandler<HTMLButtonElement> =>
        (event) => {
            if (!ref.current || !milestone.strategies) {
                return;
            }

            setDragItem({
                id: milestone.strategies[index]?.id,
                index,
                height: ref.current?.offsetHeight || 0,
            });

            if (ref?.current) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/html', ref.current.outerHTML);
                event.dataTransfer.setDragImage(ref.current, 20, 20);
            }
        };
    const onDragEnd = () => {
        setDragItem(null);
        onReOrderStrategies();
    };

    const onReOrderStrategies = () => {
        if (!milestone.strategies) {
            return;
        }
        const newStrategies = [...milestone.strategies];
        newStrategies.forEach((strategy, index) => {
            strategy.sortOrder = index;
        });
        milestoneChanged({ ...milestone, strategies: newStrategies });
    };

    const milestoneStrategyDeleted = (strategyId: string) => {
        const strategies = milestone.strategies || [];
        milestoneChanged({
            ...milestone,
            strategies: [
                ...strategies.filter((strat) => strat.id !== strategyId),
            ],
        });
    };

    const milestoneNameChanged = (name: string) => {
        milestoneChanged({ ...milestone, name });
    };

    if (!milestone.strategies || milestone.strategies.length === 0) {
        return (
            <StyledMilestoneCard
                hasError={
                    Boolean(errors?.[milestone.id]) ||
                    Boolean(errors?.[`${milestone.id}_name`])
                }
            >
                <StyledMilestoneCardBody>
                    <Grid container>
                        <StyledGridItem item xs={6} md={6}>
                            <MilestoneCardName
                                milestone={milestone}
                                errors={errors}
                                clearErrors={clearErrors}
                                milestoneNameChanged={milestoneNameChanged}
                            />
                        </StyledGridItem>
                        <StyledMilestoneActionGrid item xs={6} md={6}>
                            <Button
                                variant='outlined'
                                color='primary'
                                onClick={(ev) => setAnchor(ev.currentTarget)}
                            >
                                Add strategy
                            </Button>
                            <StyledIconButton
                                title='Remove milestone'
                                onClick={onDeleteMilestone}
                                disabled={!removable}
                            >
                                <Delete />
                            </StyledIconButton>

                            <Popover
                                id={popoverId}
                                open={isPopoverOpen}
                                anchorEl={anchor}
                                onClose={onClose}
                                onClick={onClose}
                                PaperProps={{
                                    sx: (theme) => ({
                                        paddingBottom: theme.spacing(1),
                                    }),
                                }}
                            >
                                <MilestoneStrategyMenuCards
                                    openEditAddStrategy={onSelectStrategy}
                                />
                            </Popover>
                        </StyledMilestoneActionGrid>
                    </Grid>
                </StyledMilestoneCardBody>
            </StyledMilestoneCard>
        );
    }

    return (
        <StyledAccordion>
            <StyledAccordionSummary
                expandIcon={<ExpandMore titleAccess='Toggle' />}
            >
                <MilestoneCardName
                    milestone={milestone}
                    errors={errors}
                    clearErrors={clearErrors}
                    milestoneNameChanged={milestoneNameChanged}
                />
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                {milestone.strategies.map((strg, index) => (
                    <div key={strg.id}>
                        <MilestoneStrategyDraggableItem
                            index={index}
                            onDragEnd={onDragEnd}
                            onDragStartRef={onDragStartRef}
                            onDragOver={onDragOver(strg.id)}
                            onDeleteClick={() =>
                                milestoneStrategyDeleted(strg.id)
                            }
                            onEditClick={() => {
                                onSelectEditStrategy(strg);
                            }}
                            isDragging={dragItem?.id === strg.id}
                            strategy={strg}
                        />
                    </div>
                ))}
                <StyledAccordionFooter>
                    <StyledAddStrategyButton
                        variant='outlined'
                        color='primary'
                        onClick={(ev) => setAnchor(ev.currentTarget)}
                    >
                        Add strategy
                    </StyledAddStrategyButton>
                    <Button
                        variant='text'
                        color='primary'
                        onClick={onDeleteMilestone}
                        disabled={!removable}
                    >
                        <Delete /> Remove milestone
                    </Button>
                    <Popover
                        id={popoverId}
                        open={isPopoverOpen}
                        anchorEl={anchor}
                        onClose={onClose}
                        onClick={onClose}
                        PaperProps={{
                            sx: (theme) => ({
                                paddingBottom: theme.spacing(1),
                            }),
                        }}
                    >
                        <MilestoneStrategyMenuCards
                            openEditAddStrategy={onSelectStrategy}
                        />
                    </Popover>
                </StyledAccordionFooter>
            </StyledAccordionDetails>
        </StyledAccordion>
    );
};
