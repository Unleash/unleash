import type React from 'react';
import type { VFC, FC, ReactNode } from 'react';
import { Box, styled, Typography } from '@mui/material';
import type {
    ChangeRequestState,
    IChangeRequestDeleteSegment,
    IChangeRequestUpdateSegment,
} from 'component/changeRequest/changeRequest.types';
import { useSegment } from 'hooks/api/getters/useSegment/useSegment';
import { SegmentDiff, SegmentTooltipLink } from '../../SegmentTooltipLink';
import { ConstraintAccordionList } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { ChangeOverwriteWarning } from './ChangeOverwriteWarning/ChangeOverwriteWarning';

const ChangeItemCreateEditWrapper = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto 40px',
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

export const SegmentChangeDetails: VFC<{
    actions?: ReactNode;
    change: IChangeRequestUpdateSegment | IChangeRequestDeleteSegment;
    changeRequestState: ChangeRequestState;
}> = ({ actions, change, changeRequestState }) => {
    const { segment: currentSegment } = useSegment(change.payload.id);

    return (
        <SegmentContainer conflict={change.conflict}>
            {change.action === 'deleteSegment' && (
                <ChangeItemWrapper>
                    <ChangeItemInfo>
                        <Typography
                            sx={(theme) => ({
                                color: theme.palette.error.main,
                            })}
                        >
                            - Deleting segment:
                        </Typography>
                        <SegmentTooltipLink change={change}>
                            <SegmentDiff
                                change={change}
                                currentSegment={currentSegment}
                            />
                        </SegmentTooltipLink>
                    </ChangeItemInfo>
                    <div>{actions}</div>
                </ChangeItemWrapper>
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
                            <SegmentTooltipLink change={change}>
                                <SegmentDiff
                                    change={change}
                                    currentSegment={currentSegment}
                                />
                            </SegmentTooltipLink>
                        </ChangeItemInfo>
                        <div>{actions}</div>
                    </ChangeItemCreateEditWrapper>
                    <ConstraintAccordionList
                        constraints={change.payload.constraints}
                        showLabel={false}
                    />
                </>
            )}
        </SegmentContainer>
    );
};
