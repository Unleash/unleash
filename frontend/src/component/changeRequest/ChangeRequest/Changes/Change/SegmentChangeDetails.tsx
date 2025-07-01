import type { FC, ReactNode } from 'react';
import { Box, styled, Typography } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestDeleteSegment,
    IChangeRequestUpdateSegment,
} from 'component/changeRequest/changeRequest.types';
import { useSegment } from 'hooks/api/getters/useSegment/useSegment';
import { ViewableConstraintsList } from 'component/common/NewConstraintAccordion/ConstraintsList/ViewableConstraintsList';

import { ChangeOverwriteWarning } from './ChangeOverwriteWarning/ChangeOverwriteWarning.tsx';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import { ChangeItemInfo } from './Change.styles.tsx';
import { ChangeSegmentName } from './ChangeSegmentName.tsx';
import { SegmentDiff } from './SegmentDiff.tsx';

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
        <>
            <TabList>
                <Tab>Change</Tab>
                <Tab>View diff</Tab>
            </TabList>
            {actions}
        </>
    );

    return (
        <Tabs>
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
                                    - Deleting segment
                                </Typography>
                                <ChangeSegmentName
                                    name={change.payload.name}
                                    previousName={previousName}
                                />
                            </ChangeItemInfo>
                            {actionsWithTabs}
                        </ChangeItemWrapper>

                        <TabPanel />
                        <TabPanel sx={{ mt: 1 }} variant='diff'>
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
                                <Typography>Editing segment</Typography>
                                <ChangeSegmentName name={change.payload.name} />
                            </ChangeItemInfo>
                            {actionsWithTabs}
                        </ChangeItemCreateEditWrapper>

                        <TabPanel>
                            <ViewableConstraintsList
                                constraints={change.payload.constraints}
                            />
                        </TabPanel>
                        <TabPanel variant='diff'>
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
