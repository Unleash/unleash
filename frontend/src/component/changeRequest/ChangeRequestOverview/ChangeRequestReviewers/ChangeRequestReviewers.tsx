import { Box, Paper, styled, Typography } from '@mui/material';
import { FC, ReactNode } from 'react';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { ChangeRequestRejections } from './ChangeRequestRejections';
import { ChangeRequestApprovals } from './ChangeRequestApprovals';
import { ChangeRequestType } from '../../changeRequest.types';

const StyledBox = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

export const ChangeRequestReviewersHeader: FC<{
    actualApprovals: number;
    minApprovals: number;
}> = ({ actualApprovals, minApprovals }) => {
    return (
        <>
            Reviewers{' '}
            <Typography component='span' color='text.secondary'>
                ({actualApprovals}/{minApprovals} required)
            </Typography>
        </>
    );
};

export const ChangeRequestReviewersWrapper: FC<{ header: ReactNode }> = ({
    header,
    children,
}) => {
    return (
        <Paper
            elevation={0}
            sx={(theme) => ({
                marginTop: theme.spacing(2),
                padding: theme.spacing(4),
                borderRadius: (theme) => `${theme.shape.borderRadiusLarge}px`,
            })}
        >
            <StyledBox>{header}</StyledBox>
            {children}
        </Paper>
    );
};

export const ChangeRequestReviewers: FC<{
    changeRequest: Pick<
        ChangeRequestType,
        'approvals' | 'rejections' | 'state' | 'minApprovals'
    >;
}> = ({ changeRequest }) => (
    <ChangeRequestReviewersWrapper
        header={
            <ChangeRequestReviewersHeader
                actualApprovals={changeRequest.approvals.length}
                minApprovals={changeRequest.minApprovals}
            />
        }
    >
        <ConditionallyRender
            condition={changeRequest.state === 'Rejected'}
            show={
                <ChangeRequestRejections
                    rejections={changeRequest.rejections}
                />
            }
            elseShow={
                <ChangeRequestApprovals approvals={changeRequest.approvals} />
            }
        />
    </ChangeRequestReviewersWrapper>
);
