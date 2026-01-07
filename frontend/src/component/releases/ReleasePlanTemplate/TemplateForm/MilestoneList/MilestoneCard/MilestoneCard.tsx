import {
    Button,
    Card,
    Popover,
    styled,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    FormHelperText,
} from '@mui/material';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import { type DragEventHandler, type RefObject, useState } from 'react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { MilestoneCardName } from './MilestoneCardName.tsx';
import { MilestoneStrategyMenuCards } from './MilestoneStrategyMenu/MilestoneStrategyMenuCards.tsx';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ReleasePlanTemplateAddStrategyForm } from '../../MilestoneStrategy/ReleasePlanTemplateAddStrategyForm.tsx';
import { type OnMoveItem, useDragItem } from 'hooks/useDragItem';
import type { IExtendedMilestonePayload } from 'component/releases/hooks/useTemplateForm';

import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/DeleteOutlined';
import { StrategyDraggableItem } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyDraggableItem';
import { StrategyList } from 'component/common/StrategyList/StrategyList';
import { StrategyListItem } from 'component/common/StrategyList/StrategyListItem';
import { MilestoneCardDragHandle } from './MilestoneCardDragHandle.tsx';

const leftPadding = 3;

const DraggableCardContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(2),
    '--left-padding': `var(--form-content-padding, ${theme.spacing(4)})`,
    // for accessibility, never make button smaller than 32px
    '--drag-column-width': `max(var(--left-padding), ${theme.spacing(4)})`,
    '--left-offset': `calc(var(--left-padding) * -1)`,
    marginLeft: `var(--left-offset)`,
    display: 'grid',
    gridTemplateColumns: `var(--drag-column-width) 1fr`,
}));

const StyledMilestoneCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError: boolean }>(({ theme, hasError }) => ({
    position: 'relative',
    overflow: 'initial',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 2),
    paddingLeft: theme.spacing(leftPadding),
    flexDirection: 'row',
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

const FlexContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row',
    alignItems: 'center',
}));

const StyledAddStrategyButton = styled(Button)(({ theme }) => ({}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
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
    overflow: 'hidden',
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    boxShadow: 'none',
    padding: theme.spacing(1.5, 2),
    paddingLeft: theme.spacing(leftPadding),
    borderRadius: theme.shape.borderRadiusMedium,
    [theme.breakpoints.down(400)]: {
        padding: theme.spacing(1, 2),
    },
    '&:focus-visible': {
        background: theme.palette.table.headerHover,
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    borderBottomLeftRadius: theme.shape.borderRadiusMedium,
    borderBottomRightRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(0),
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledAccordionFooter = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(3),
    backgroundColor: 'inherit',
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.main,
}));

export interface IMilestoneCardProps {
    milestone: IExtendedMilestonePayload;
    milestoneChanged: (milestone: IExtendedMilestonePayload) => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
    removable: boolean;
    onDeleteMilestone: () => void;
    index: number;
    onMoveItem: OnMoveItem;
}

export const MilestoneCard = ({
    milestone,
    milestoneChanged,
    errors,
    clearErrors,
    removable,
    onDeleteMilestone,
    index,
    onMoveItem,
}: IMilestoneCardProps) => {
    const [anchor, setAnchor] = useState<Element>();
    const [dragItem, setDragItem] = useState<{
        id: string;
        index: number;
        height: number;
    } | null>(null);
    const [addUpdateStrategyOpen, setAddUpdateStrategyOpen] = useState(false);
    const [strategyModeEdit, setStrategyModeEdit] = useState(false);
    const [expanded, setExpanded] = useState(Boolean(milestone.startExpanded));
    const isPopoverOpen = Boolean(anchor);
    const popoverId = isPopoverOpen
        ? 'MilestoneStrategyMenuPopover'
        : undefined;

    const dragItemRef = useDragItem<HTMLSpanElement>(index, onMoveItem);

    const onClose = () => {
        setAnchor(undefined);
    };

    const [currentStrategy, setCurrentStrategy] = useState<
        Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>
    >({
        name: 'flexibleRollout',
        parameters: { rollout: '50' },
        constraints: [],
        title: '',
        id: 'temp',
    });

    const milestoneStrategyChanged = (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        const strategies = milestone.strategies || [];
        milestoneChanged({
            ...milestone,
            strategies: [
                ...strategies.map((strat) =>
                    strat.id === strategy.id ? strategy : strat,
                ),
            ],
        });
    };

    const milestoneStrategyAdded = (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        milestoneChanged({
            ...milestone,
            strategies: [
                ...(milestone.strategies || []),
                {
                    ...strategy,
                    strategyName: strategy.strategyName,
                    sortOrder: milestone.strategies?.length || 0,
                },
            ],
        });
    };

    const addUpdateStrategy = (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        const existingStrategy = milestone.strategies?.find(
            (strat) => strat.id === strategy.id,
        );
        if (existingStrategy) {
            milestoneStrategyChanged(strategy);
        } else {
            milestoneStrategyAdded(strategy);
            setExpanded(true);
        }
        setAddUpdateStrategyOpen(false);
        setStrategyModeEdit(false);
        setCurrentStrategy({
            name: 'flexibleRollout',
            parameters: { rollout: '50' },
            constraints: [],
            title: '',
            id: 'temp',
        });
        clearErrors();
    };

    const openAddUpdateStrategyForm = (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
        editing: boolean,
    ) => {
        setStrategyModeEdit(editing);
        setCurrentStrategy(strategy);
        setAddUpdateStrategyOpen(true);
    };

    const onStrategyDragOver =
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

    const onStrategyDragStartRef =
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

            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/html', ref.current.outerHTML);
            event.dataTransfer.setDragImage(ref.current, 20, 20);
        };

    const onStrategyDragEnd = () => {
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
            <>
                <DraggableCardContainer>
                    <MilestoneCardDragHandle dragItemRef={dragItemRef} />
                    <StyledMilestoneCard
                        hasError={
                            Boolean(errors?.[milestone.id]) ||
                            Boolean(errors?.[`${milestone.id}_name`])
                        }
                    >
                        <FlexContainer>
                            <MilestoneCardName
                                milestone={milestone}
                                errors={errors}
                                clearErrors={clearErrors}
                                milestoneNameChanged={milestoneNameChanged}
                            />
                        </FlexContainer>
                        <FlexContainer>
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
                                    openEditAddStrategy={(strategy) => {
                                        openAddUpdateStrategyForm(
                                            strategy,
                                            false,
                                        );
                                    }}
                                />
                            </Popover>
                        </FlexContainer>
                    </StyledMilestoneCard>
                </DraggableCardContainer>
                <FormHelperText error={Boolean(errors?.[milestone.id])}>
                    {errors?.[milestone.id]}
                </FormHelperText>
                <SidebarModal
                    label='Add strategy to template milestone'
                    onClose={() => {
                        setAddUpdateStrategyOpen(false);
                        setStrategyModeEdit(false);
                    }}
                    open={addUpdateStrategyOpen}
                >
                    <ReleasePlanTemplateAddStrategyForm
                        strategy={currentStrategy}
                        onAddUpdateStrategy={addUpdateStrategy}
                        onCancel={() => {
                            setAddUpdateStrategyOpen(false);
                            setStrategyModeEdit(false);
                        }}
                        editMode={strategyModeEdit}
                    />
                </SidebarModal>
            </>
        );
    }

    return (
        <>
            <DraggableCardContainer>
                <MilestoneCardDragHandle dragItemRef={dragItemRef} />
                <StyledAccordion
                    expanded={expanded}
                    onChange={(_e, change) => setExpanded(change)}
                >
                    <StyledAccordionSummary
                        expandIcon={
                            <ExpandMore
                                titleAccess={`${expanded ? 'Hide' : 'Show'} milestone strategies`}
                            />
                        }
                        id={`milestone-accordion-summary-${milestone.id}`}
                        aria-controls={`milestone-accordion-details-${milestone.id}`}
                    >
                        <MilestoneCardName
                            milestone={milestone}
                            errors={errors}
                            clearErrors={clearErrors}
                            milestoneNameChanged={milestoneNameChanged}
                        />
                    </StyledAccordionSummary>
                    <StyledAccordionDetails>
                        <StrategyList>
                            {milestone.strategies.map((strg, index) => (
                                <StrategyListItem key={strg.id}>
                                    {index > 0 ? <StrategySeparator /> : null}

                                    <StrategyDraggableItem
                                        index={index}
                                        onDragEnd={onStrategyDragEnd}
                                        onDragStartRef={onStrategyDragStartRef}
                                        onDragOver={onStrategyDragOver(strg.id)}
                                        isDragging={dragItem?.id === strg.id}
                                        strategy={{
                                            ...strg,
                                            name:
                                                strg.name ||
                                                strg.strategyName ||
                                                '',
                                        }}
                                        headerItemsRight={
                                            <>
                                                <IconButton
                                                    title='Edit strategy'
                                                    onClick={() => {
                                                        openAddUpdateStrategyForm(
                                                            strg,
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    title='Remove strategy'
                                                    onClick={() =>
                                                        milestoneStrategyDeleted(
                                                            strg.id,
                                                        )
                                                    }
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </>
                                        }
                                    />
                                </StrategyListItem>
                            ))}
                        </StrategyList>
                        <StyledAccordionFooter>
                            <Button
                                variant='text'
                                color='primary'
                                onClick={onDeleteMilestone}
                                disabled={!removable}
                            >
                                <Delete /> Remove milestone
                            </Button>
                            <StyledAddStrategyButton
                                variant='outlined'
                                color='primary'
                                onClick={(ev) => setAnchor(ev.currentTarget)}
                            >
                                Add strategy
                            </StyledAddStrategyButton>
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
                                    openEditAddStrategy={(strategy) => {
                                        openAddUpdateStrategyForm(
                                            strategy,
                                            false,
                                        );
                                    }}
                                />
                            </Popover>
                        </StyledAccordionFooter>
                    </StyledAccordionDetails>
                </StyledAccordion>
            </DraggableCardContainer>

            <FormHelperText error={Boolean(errors?.[milestone.id])}>
                {errors?.[milestone.id]}
            </FormHelperText>

            <SidebarModal
                label='Add strategy to template milestone'
                onClose={() => {
                    setAddUpdateStrategyOpen(false);
                    setStrategyModeEdit(false);
                }}
                open={addUpdateStrategyOpen}
            >
                <ReleasePlanTemplateAddStrategyForm
                    strategy={currentStrategy}
                    onAddUpdateStrategy={addUpdateStrategy}
                    onCancel={() => {
                        setAddUpdateStrategyOpen(false);
                        setStrategyModeEdit(false);
                    }}
                    editMode={strategyModeEdit}
                />
            </SidebarModal>
        </>
    );
};
