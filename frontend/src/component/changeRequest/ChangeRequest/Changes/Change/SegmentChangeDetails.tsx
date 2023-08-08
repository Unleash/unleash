import { VFC, FC, ReactNode } from 'react';
import { Box, styled, Typography } from '@mui/material';
import {
    IChangeRequestDeleteSegment,
    IChangeRequestUpdateSegment,
} from 'component/changeRequest/changeRequest.types';
import { useSegment } from 'hooks/api/getters/useSegment/useSegment';
import { SegmentDiff, SegmentTooltipLink } from '../../SegmentTooltipLink';

const ChangeItemCreateEditWrapper = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto 40px',
    gap: theme.spacing(1),
    alignItems: 'center',
    width: '100%',
}));

export const ChangeItemWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const ChangeItemInfo: FC = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '150px auto',
    gridAutoFlow: 'column',
    alignItems: 'center',
    flexGrow: 1,
    gap: theme.spacing(1),
}));

const SegmentContainer = styled(Box)(({ theme }) => ({
    borderLeft: '1px solid',
    borderRight: '1px solid',
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    borderTopColor: theme.palette.divider,
    padding: theme.spacing(3),
    borderRadius: `0 0 ${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px`,
}));

export const SegmentChangeDetails: VFC<{
    discard?: ReactNode;
    change: IChangeRequestUpdateSegment | IChangeRequestDeleteSegment;
}> = ({ discard, change }) => {
    const { segment: currentSegment } = useSegment(change.payload.id);

    return (
        <SegmentContainer
            sx={theme => ({
                borderColor: change.conflict
                    ? theme.palette.warning.border
                    : theme.palette.divider,
                borderTopColor: theme.palette.divider,
            })}
        >
            {change.action === 'deleteSegment' && (
                <ChangeItemWrapper>
                    <ChangeItemInfo>
                        <Typography
                            sx={theme => ({
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
                    <div>{discard}</div>
                </ChangeItemWrapper>
            )}
            {change.action === 'updateSegment' && (
                <>
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
                        <div>{discard}</div>
                    </ChangeItemCreateEditWrapper>
                </>
            )}
        </SegmentContainer>
    );
};
