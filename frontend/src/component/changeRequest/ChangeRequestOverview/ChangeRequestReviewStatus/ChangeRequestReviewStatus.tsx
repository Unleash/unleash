import { FC } from 'react';
import { Box, Theme, Typography, useTheme } from '@mui/material';
import { ReactComponent as ChangesAppliedIcon } from 'assets/icons/merge.svg';
import {
    StyledOuterContainer,
    StyledButtonContainer,
    StyledReviewStatusContainer,
    StyledFlexAlignCenterBox,
    StyledSuccessIcon,
    StyledErrorIcon,
    StyledReviewTitle,
    StyledDivider,
} from './ChangeRequestReviewStatus.styles';
import { ChangeRequestState } from 'component/changeRequest/changeRequest.types';
interface ISuggestChangeReviewsStatusProps {
    state: ChangeRequestState;
}

const resolveBorder = (state: ChangeRequestState, theme: Theme) => {
    if (state === 'Approved') {
        return `2px solid ${theme.palette.success.main}`;
    }

    if (state === 'Applied') {
        return `2px solid ${theme.palette.primary.main}`;
    }

    return `1px solid ${theme.palette.tertiary.main}`;
};

const resolveIconColors = (state: ChangeRequestState, theme: Theme) => {
    if (state === 'Approved') {
        return {
            bgColor: theme.palette.success.main!,
            svgColor: theme.palette.tertiary.background,
        };
    }

    if (state === 'Applied') {
        return {
            bgColor: theme.palette.primary.main!,
            svgColor: theme.palette.tertiary.background,
        };
    }

    return {
        bgColor: theme.palette.tableHeaderBackground,
        svgColor: theme.palette.neutral.main!,
    };
};

export const ChangeRequestReviewStatus: FC<
    ISuggestChangeReviewsStatusProps
> = ({ state }) => {
    const theme = useTheme();

    return (
        <StyledOuterContainer>
            <StyledButtonContainer {...resolveIconColors(state, theme)}>
                <ChangesAppliedIcon
                    style={{
                        transform: `scale(1.5)`,
                    }}
                />
            </StyledButtonContainer>
            <StyledReviewStatusContainer border={resolveBorder(state, theme)}>
                <ResolveComponent state={state} />
            </StyledReviewStatusContainer>
        </StyledOuterContainer>
    );
};

interface IResolveComponentProps {
    state: ChangeRequestState;
}

const ResolveComponent = ({ state }: IResolveComponentProps) => {
    if (!state) {
        return null;
    }

    if (state === 'Approved') {
        return <Approved />;
    }

    if (state === 'Applied') {
        return <Applied />;
    }

    if (state === 'Cancelled') {
        return <Cancelled />;
    }

    return <ReviewRequired />;
};

const Approved = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.success.main}>
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
                    <StyledReviewTitle color={theme.palette.success.main}>
                        Changes are ready to be applied
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};

const ReviewRequired = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledErrorIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.error.main}>
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
                <StyledReviewTitle color={theme.palette.error.main}>
                    Apply changes is blocked
                </StyledReviewTitle>
            </StyledFlexAlignCenterBox>
        </>
    );
};

const Applied = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon sx={{ color: theme.palette.primary.main }} />
                <Box>
                    <StyledReviewTitle color={theme.palette.primary.main}>
                        Changes applied
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};

const Cancelled = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledErrorIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.error.main}>
                        Changes cancelled
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};
