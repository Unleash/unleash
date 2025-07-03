import type { FC, ReactNode } from 'react';
import { Box, styled } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestDeleteSegment,
    IChangeRequestUpdateSegment,
} from 'component/changeRequest/changeRequest.types';
import { useSegment } from 'hooks/api/getters/useSegment/useSegment';
import { ViewableConstraintsList } from 'component/common/NewConstraintAccordion/ConstraintsList/ViewableConstraintsList';

import { ChangeOverwriteWarning } from './ChangeOverwriteWarning/ChangeOverwriteWarning.tsx';
import { Tab, TabList, TabPanel, Tabs } from './ChangeTabComponents.tsx';
import {
    Action,
    ChangeItemInfo,
    ChangeItemWrapper,
    Deleted,
} from './Change.styles.tsx';
import { SegmentDiff } from './SegmentDiff.tsx';
import { NameWithChangeInfo } from './NameWithChangeInfo/NameWithChangeInfo.tsx';

const ChangeItemCreateEditWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(1),
    alignItems: 'center',
    width: '100%',
    margin: theme.spacing(0, 0, 1, 0),
}));

const ActionsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
    columnGap: theme.spacing(1),
}));

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
        <ActionsContainer>
            <TabList>
                <Tab>Change</Tab>
                <Tab>View diff</Tab>
            </TabList>
            {actions}
        </ActionsContainer>
    );

    return (
        <Tabs>
            <SegmentContainer conflict={change.conflict}>
                {change.action === 'deleteSegment' && (
                    <>
                        <ChangeItemWrapper>
                            <ChangeItemInfo>
                                <Deleted>Deleting segment</Deleted>
                                <NameWithChangeInfo
                                    newName={change.payload.name}
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
                                <Action>Editing segment</Action>
                                <NameWithChangeInfo
                                    newName={change.payload.name}
                                />
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
