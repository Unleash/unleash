import {
    type DragEventHandler,
    type RefObject,
    useEffect,
    useState,
} from 'react';
import { Alert, Pagination, styled } from '@mui/material';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategyDraggableItem } from '../FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyDraggableItem';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';
import { FeatureStrategyEmpty } from 'component/feature/FeatureStrategy/FeatureStrategyEmpty/FeatureStrategyEmpty';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import usePagination from 'hooks/usePagination';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useUiFlag } from 'hooks/useUiFlag';
import isEqual from 'lodash/isEqual';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';
import { ReleasePlan } from '../ReleasePlan/ReleasePlan';
import { SectionSeparator } from '../FeatureOverviewEnvironments/FeatureOverviewEnvironment/SectionSeparator/SectionSeparator';
import { Badge } from 'component/common/Badge/Badge';

interface IEnvironmentAccordionBodyProps {
    isDisabled: boolean;
    featureEnvironment?: IFeatureEnvironment;
    otherEnvironments?: IFeatureEnvironment['name'][];
}

const StyledAccordionBody = styled('div')(({ theme }) => ({
    width: '100%',
    position: 'relative',
    paddingBottom: theme.spacing(2),
}));

const StyledAccordionBodyInnerContainer = styled('div')(({ theme }) => ({
    [theme.breakpoints.down(400)]: {
        padding: theme.spacing(1),
    },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    border: 'none',
    padding: theme.spacing(0.75, 1.5),
    borderRadius: theme.shape.borderRadiusLarge,
    color: theme.palette.common.white,
}));

export const FeatureOverviewEnvironmentBody = ({
    featureEnvironment,
    isDisabled,
    otherEnvironments,
}: IEnvironmentAccordionBodyProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { setStrategiesSortOrder } = useFeatureStrategyApi();
    const { addChange } = useChangeRequestApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(projectId, featureId);
    const manyStrategiesPagination = useUiFlag('manyStrategiesPagination');
    const [strategies, setStrategies] = useState(
        featureEnvironment?.strategies || [],
    );
    const { releasePlans } = useReleasePlans(
        projectId,
        featureId,
        featureEnvironment?.name,
    );
    const { trackEvent } = usePlausibleTracker();

    const [dragItem, setDragItem] = useState<{
        id: string;
        index: number;
        height: number;
    } | null>(null);

    const [isReordering, setIsReordering] = useState(false);

    useEffect(() => {
        if (isReordering) {
            if (isEqual(featureEnvironment?.strategies, strategies)) {
                setIsReordering(false);
            }
        } else {
            setStrategies(featureEnvironment?.strategies || []);
        }
    }, [featureEnvironment?.strategies]);

    useEffect(() => {
        if (strategies.length > 50) {
            trackEvent('many-strategies');
        }
    }, []);

    if (!featureEnvironment) {
        return null;
    }

    const pageSize = 20;
    const { page, pages, setPageIndex, pageIndex } =
        usePagination<IFeatureStrategy>(strategies, pageSize);

    const onReorder = async (payload: { id: string; sortOrder: number }[]) => {
        try {
            await setStrategiesSortOrder(
                projectId,
                featureId,
                featureEnvironment.name,
                payload,
            );
            refetchFeature();
            setToastData({
                text: 'Order of strategies updated',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onChangeRequestReorder = async (
        payload: { id: string; sortOrder: number }[],
    ) => {
        await addChange(projectId, featureEnvironment.name, {
            action: 'reorderStrategy',
            feature: featureId,
            payload,
        });

        setToastData({
            text: 'Strategy execution order added to draft',
            type: 'success',
        });
        refetchChangeRequests();
    };

    const onStrategyReorder = async (
        payload: { id: string; sortOrder: number }[],
    ) => {
        try {
            if (isChangeRequestConfigured(featureEnvironment.name)) {
                await onChangeRequestReorder(payload);
            } else {
                await onReorder(payload);
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onDragStartRef =
        (
            ref: RefObject<HTMLDivElement>,
            index: number,
        ): DragEventHandler<HTMLButtonElement> =>
        (event) => {
            setIsReordering(true);
            setDragItem({
                id: strategies[index].id,
                index,
                height: ref.current?.offsetHeight || 0,
            });

            if (ref?.current) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/html', ref.current.outerHTML);
                event.dataTransfer.setDragImage(ref.current, 20, 20);
            }
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
                const newStrategies = [...strategies];
                const movedStrategy = newStrategies.splice(
                    dragItem.index,
                    1,
                )[0];
                newStrategies.splice(targetIndex, 0, movedStrategy);
                setStrategies(newStrategies);
                setDragItem({
                    ...dragItem,
                    index: targetIndex,
                });
            }
        };

    const onDragEnd = () => {
        setDragItem(null);
        onStrategyReorder(
            strategies.map((strategy, sortOrder) => ({
                id: strategy.id,
                sortOrder,
            })),
        );
    };

    const strategiesToDisplay = isReordering
        ? strategies
        : featureEnvironment.strategies;

    return (
        <StyledAccordionBody>
            <StyledAccordionBodyInnerContainer>
                <ConditionallyRender
                    condition={
                        (releasePlans.length > 0 ||
                            strategiesToDisplay.length > 0) &&
                        isDisabled
                    }
                    show={() => (
                        <Alert severity='warning' sx={{ mb: 2 }}>
                            This environment is disabled, which means that none
                            of your strategies are executing.
                        </Alert>
                    )}
                />
                <ConditionallyRender
                    condition={
                        releasePlans.length > 0 ||
                        strategiesToDisplay.length > 0
                    }
                    show={
                        <>
                            {releasePlans.map((plan) => (
                                <ReleasePlan
                                    key={plan.id}
                                    plan={plan}
                                    environmentIsDisabled={isDisabled}
                                />
                            ))}
                            <ConditionallyRender
                                condition={
                                    releasePlans.length > 0 &&
                                    strategies.length > 0
                                }
                                show={
                                    <SectionSeparator>
                                        <StyledBadge>OR</StyledBadge>
                                    </SectionSeparator>
                                }
                            />
                            <ConditionallyRender
                                condition={
                                    strategiesToDisplay.length < 50 ||
                                    !manyStrategiesPagination
                                }
                                show={
                                    <>
                                        {strategiesToDisplay.map(
                                            (strategy, index) => (
                                                <StrategyDraggableItem
                                                    key={strategy.id}
                                                    strategy={strategy}
                                                    index={index}
                                                    environmentName={
                                                        featureEnvironment.name
                                                    }
                                                    otherEnvironments={
                                                        otherEnvironments
                                                    }
                                                    isDragging={
                                                        dragItem?.id ===
                                                        strategy.id
                                                    }
                                                    onDragStartRef={
                                                        onDragStartRef
                                                    }
                                                    onDragOver={onDragOver(
                                                        strategy.id,
                                                    )}
                                                    onDragEnd={onDragEnd}
                                                />
                                            ),
                                        )}
                                    </>
                                }
                                elseShow={
                                    <>
                                        <Alert severity='error'>
                                            We noticed you're using a high
                                            number of activation strategies. To
                                            ensure a more targeted approach,
                                            consider leveraging constraints or
                                            segments.
                                        </Alert>
                                        <br />
                                        {page.map((strategy, index) => (
                                            <StrategyDraggableItem
                                                key={strategy.id}
                                                strategy={strategy}
                                                index={
                                                    index + pageIndex * pageSize
                                                }
                                                environmentName={
                                                    featureEnvironment.name
                                                }
                                                otherEnvironments={
                                                    otherEnvironments
                                                }
                                                isDragging={false}
                                                onDragStartRef={
                                                    (() => {}) as any
                                                }
                                                onDragOver={(() => {}) as any}
                                                onDragEnd={(() => {}) as any}
                                            />
                                        ))}
                                        <br />
                                        <Pagination
                                            count={pages.length}
                                            shape='rounded'
                                            page={pageIndex + 1}
                                            onChange={(_, page) =>
                                                setPageIndex(page - 1)
                                            }
                                        />
                                    </>
                                }
                            />
                        </>
                    }
                    elseShow={
                        <FeatureStrategyEmpty
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={featureEnvironment.name}
                        />
                    }
                />
            </StyledAccordionBodyInnerContainer>
        </StyledAccordionBody>
    );
};
