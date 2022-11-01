import { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { ReactComponent as ChangesAppliedIcon } from 'assets/icons/merge.svg';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    StyledOuterContainer,
    StyledButtonContainer,
    StyledReviewStatusContainer,
    StyledFlexAlignCenterBox,
    StyledSuccessIcon,
    StyledErrorIcon,
    StyledReviewTitle,
    StyledDivider,
} from './SuggestChangeReviewStatus.styles';

interface ISuggestChangeReviewsStatusProps {
    approved: boolean;
}

export const SuggestedChangeReviewStatus: FC<
    ISuggestChangeReviewsStatusProps
> = ({ approved }) => {
    return (
        <StyledOuterContainer>
            <StyledButtonContainer approved={approved}>
                <ChangesAppliedIcon
                    style={{
                        transform: `scale(1.5)`,
                    }}
                />
            </StyledButtonContainer>
            <StyledReviewStatusContainer approved={approved}>
                <StyledFlexAlignCenterBox>
                    <ConditionallyRender
                        condition={approved}
                        show={<Approved approved={approved} />}
                        elseShow={<ReviewRequired approved={approved} />}
                    />
                </StyledFlexAlignCenterBox>
            </StyledReviewStatusContainer>
        </StyledOuterContainer>
    );
};

const Approved = ({ approved }: ISuggestChangeReviewsStatusProps) => {
    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon />
                <Box>
                    <StyledReviewTitle approved={approved}>
                        Changed approved
                    </StyledReviewTitle>
                    <Typography>
                        One approving review from requested approvers
                    </Typography>
                </Box>
            </StyledFlexAlignCenterBox>

            <StyledDivider />

            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon />
                <Box>
                    <StyledReviewTitle approved={approved}>
                        Changes are ready to be applied
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};

const ReviewRequired = ({ approved }: ISuggestChangeReviewsStatusProps) => {
    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledErrorIcon />
                <Box>
                    <StyledReviewTitle approved={approved}>
                        Review required
                    </StyledReviewTitle>
                    <Typography>
                        At least 1 approving review must be submitted before
                        changes can be applied
                    </Typography>
                </Box>
            </StyledFlexAlignCenterBox>

            <StyledDivider />

            <StyledFlexAlignCenterBox>
                <StyledErrorIcon />
                <StyledReviewTitle approved={approved}>
                    Apply changes is blocked
                </StyledReviewTitle>
            </StyledFlexAlignCenterBox>
        </>
    );
};
