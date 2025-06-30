import type React from 'react';
import type { FC, ReactNode } from 'react';
import {
    Box,
    Button,
    type ButtonProps,
    styled,
    Typography,
} from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestDeleteSegment,
    IChangeRequestUpdateSegment,
} from 'component/changeRequest/changeRequest.types';
import { useSegment } from 'hooks/api/getters/useSegment/useSegment';
import { SegmentDiff, SegmentTooltipLink } from '../../SegmentTooltipLink.tsx';
import { Tab, TabPanel, Tabs, TabsList } from '@mui/base';
import { ViewableConstraintsList } from 'component/common/NewConstraintAccordion/ConstraintsList/ViewableConstraintsList';

import { ChangeOverwriteWarning } from './ChangeOverwriteWarning/ChangeOverwriteWarning.tsx';

const ChangeItemCreateEditWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    width: '100%',
    margin: theme.spacing(0, 0, 1, 0),
}));

export const ChangeItemWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const ChangeItemInfo: FC<{ children?: React.ReactNode }> = styled(Box)(
    ({ theme }) => ({
        display: 'grid',
        gridTemplateColumns: '150px auto',
        gridAutoFlow: 'column',
        alignItems: 'center',
        flexGrow: 1,
        gap: theme.spacing(1),
    }),
);

const SegmentContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'conflict',
})<{ conflict: string | undefined }>(({ theme, conflict }) => ({
    borderLeft: '1px solid',
    borderRight: '1px solid',
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: conflict
        ? theme.palette.warning.border
        : theme.palette.divider,
    borderTopColor: theme.palette.divider,
    padding: theme.spacing(3),
    borderRadius: `0 0 ${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px`,
}));

const ActionsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

const StyledTabList = styled(TabsList)(({ theme }) => ({
    display: 'inline-flex',
    flexDirection: 'row',
    gap: theme.spacing(0.5),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    whiteSpace: 'nowrap',
    color: theme.palette.text.secondary,
    fontWeight: 'normal',
    '&[aria-selected="true"]': {
        fontWeight: 'bold',
        color: theme.palette.primary.main,
        background: theme.palette.background.elevation1,
    },
}));

export const StyledTab = styled(({ children }: ButtonProps) => (
    <Tab slots={{ root: StyledButton }}>{children}</Tab>
))(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(-0.5),
    left: theme.spacing(2),
    transform: 'translateY(-50%)',
    padding: theme.spacing(0.75, 1),
    lineHeight: 1,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.primary,
    background: theme.palette.background.application,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    zIndex: theme.zIndex.fab,
    textTransform: 'uppercase',
}));

export const SegmentChangeDetails: FC<{
    actions?: ReactNode;
    change: IChangeRequestUpdateSegment | IChangeRequestDeleteSegment;
    changeRequestState: ChangeRequestState;
}> = ({ actions, change, changeRequestState }) => {
    const { segment: currentSegment } = useSegment(change.payload.id);
    const snapshotSegment = change.payload.snapshot;
    const previousName =
        changeRequestState === 'Applied'
            ? change.payload?.snapshot?.name
            : currentSegment?.name;
    const referenceSegment =
        changeRequestState === 'Applied' ? snapshotSegment : currentSegment;

    const actionsWithTabs = (
        <ActionsContainer>
            <StyledTabList>
                <StyledTab>Change</StyledTab>
                <StyledTab>View diff</StyledTab>
            </StyledTabList>
            {actions}
        </ActionsContainer>
    );

    return (
        <Tabs
            aria-label='View rendered change or JSON diff'
            selectionFollowsFocus
            defaultValue={0}
        >
            <SegmentContainer conflict={change.conflict}>
                {change.action === 'deleteSegment' && (
                    <>
                        <ChangeItemWrapper>
                            <ChangeItemInfo>
                                <Typography
                                    sx={(theme) => ({
                                        color: theme.palette.error.main,
                                    })}
                                >
                                    - Deleting segment:
                                </Typography>
                                <SegmentTooltipLink
                                    name={change.payload.name}
                                    previousName={previousName}
                                >
                                    <SegmentDiff
                                        change={change}
                                        currentSegment={referenceSegment}
                                    />
                                </SegmentTooltipLink>
                            </ChangeItemInfo>
                            {actionsWithTabs}
                        </ChangeItemWrapper>

                        <TabPanel />
                        <TabPanel>
                            <SegmentDiff
                                change={change}
                                currentSegment={referenceSegment}
                            />
                        </TabPanel>
                    </>
                )}
                {change.action === 'updateSegment' && (
                    <>
                        <ChangeOverwriteWarning
                            data={{
                                current: currentSegment,
                                change,
                                changeType: 'segment',
                            }}
                            changeRequestState={changeRequestState}
                        />
                        <ChangeItemCreateEditWrapper>
                            <ChangeItemInfo>
                                <Typography>Editing segment:</Typography>
                                <SegmentTooltipLink name={change.payload.name}>
                                    <SegmentDiff
                                        change={change}
                                        currentSegment={referenceSegment}
                                    />
                                </SegmentTooltipLink>
                            </ChangeItemInfo>
                            {actionsWithTabs}
                        </ChangeItemCreateEditWrapper>

                        <TabPanel>
                            <ViewableConstraintsList
                                constraints={change.payload.constraints}
                            />
                        </TabPanel>
                        <TabPanel>
                            <SegmentDiff
                                change={change}
                                currentSegment={referenceSegment}
                            />
                        </TabPanel>
                    </>
                )}
            </SegmentContainer>
        </Tabs>
    );
};
