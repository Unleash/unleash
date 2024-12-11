import Input from 'component/common/Input/Input';
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
} from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import type {
    IReleasePlanMilestonePayload,
    IReleasePlanMilestoneStrategy,
} from 'interfaces/releasePlans';
import { type DragEventHandler, type RefObject, useState } from 'react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { MilestoneStrategyMenuCards } from './MilestoneStrategyMenuCards';
import { MilestoneStrategyDraggableItem } from './MilestoneStrategyDraggableItem';

const StyledEditIcon = styled(Edit)(({ theme }) => ({
    cursor: 'pointer',
    marginTop: theme.spacing(-0.25),
    marginLeft: theme.spacing(0.5),
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    color: theme.palette.text.secondary,
}));

const StyledMilestoneCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
    transition: 'background-color 0.2s ease-in-out',
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.neutral.light,
    },
}));

const StyledMilestoneCardBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 2),
}));

const StyledGridItem = styled(Grid)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
}));

const StyledMilestoneCardTitle = styled('span')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.bodySize,
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
    transition: 'background-color 0.2s ease-in-out',
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.neutral.light,
    },
    '&.Mui-expanded': {
        marginTop: theme.spacing(3),
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    boxShadow: 'none',
    padding: theme.spacing(1.5, 2),
    [theme.breakpoints.down(400)]: {
        padding: theme.spacing(1, 2),
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

interface IMilestoneCardProps {
    milestone: IReleasePlanMilestonePayload;
    milestoneChanged: (milestone: IReleasePlanMilestonePayload) => void;
    showAddStrategyDialog: (
        milestoneId: string,
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
}

export const MilestoneCard = ({
    milestone,
    milestoneChanged,
    showAddStrategyDialog,
    errors,
    clearErrors,
}: IMilestoneCardProps) => {
    const [editMode, setEditMode] = useState(false);
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

    const onSelectStrategy = (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => {
        showAddStrategyDialog(milestone.id, strategy);
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
            <StyledMilestoneCard>
                <StyledMilestoneCardBody>
                    <Grid container>
                        <StyledGridItem item xs={10} md={10}>
                            {editMode && (
                                <StyledInput
                                    label=''
                                    value={milestone.name}
                                    onChange={(e) =>
                                        milestoneNameChanged(e.target.value)
                                    }
                                    error={Boolean(errors?.name)}
                                    errorText={errors?.name}
                                    onFocus={() => clearErrors()}
                                    onBlur={() => setEditMode(false)}
                                    autoFocus
                                    onKeyDownCapture={(e) => {
                                        if (e.code === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setEditMode(false);
                                        }
                                    }}
                                />
                            )}
                            {!editMode && (
                                <>
                                    <StyledMilestoneCardTitle
                                        onClick={() => setEditMode(true)}
                                    >
                                        {milestone.name}
                                    </StyledMilestoneCardTitle>
                                    <StyledEditIcon
                                        onClick={() => setEditMode(true)}
                                    />
                                </>
                            )}
                        </StyledGridItem>
                        <Grid item xs={2} md={2}>
                            <Button
                                variant='outlined'
                                color='primary'
                                onClick={(ev) => setAnchor(ev.currentTarget)}
                            >
                                Add strategy
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
                        </Grid>
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
                {editMode && (
                    <StyledInput
                        label=''
                        value={milestone.name}
                        onChange={(e) => milestoneNameChanged(e.target.value)}
                        error={Boolean(errors?.name)}
                        errorText={errors?.name}
                        onFocus={() => clearErrors()}
                        onBlur={() => setEditMode(false)}
                        autoFocus
                        onKeyDownCapture={(e) => {
                            if (e.code === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditMode(false);
                            }
                        }}
                    />
                )}
                {!editMode && (
                    <>
                        <StyledMilestoneCardTitle
                            onClick={() => setEditMode(true)}
                        >
                            {milestone.name}
                        </StyledMilestoneCardTitle>
                        <StyledEditIcon onClick={() => setEditMode(true)} />
                    </>
                )}
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
                                onSelectStrategy(strg);
                            }}
                            isDragging={false}
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
