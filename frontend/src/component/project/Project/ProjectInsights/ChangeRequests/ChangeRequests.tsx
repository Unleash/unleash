import { Box, styled, Typography } from '@mui/material';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Link } from 'react-router-dom';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { useChangeRequestsCount } from 'hooks/api/getters/useChangeRequestsCount/useChangeRequestsCount';

const Container = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
}));

const BoxesContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
    flexWrap: 'wrap',
}));

const NumberBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
}));

const OpenBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(3),
    border: `2px solid ${theme.palette.primary.main}`,
}));

const ColorBox = styled(Box)(({ theme }) => ({
    borderRadius: '8px',
    padding: theme.spacing(1, 2),
    display: 'flex',
    gap: theme.spacing(6),
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    whiteSpace: 'nowrap',
}));

const ApplyBox = styled(ColorBox)(({ theme }) => ({
    background: theme.palette.success.light,
    marginTop: theme.spacing(2.5),
}));

const ReviewBox = styled(ColorBox)(({ theme }) => ({
    background: theme.palette.secondary.light,
}));

const ChangeRequestNavigation = styled(Link)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    textDecoration: 'none',
    color: theme.palette.text.primary,
}));

const Title = styled(Typography)(({ theme }) => ({
    fontSize: theme.spacing(2),
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const MediumNumber = styled(Typography)(({ theme }) => ({
    fontSize: theme.spacing(3),
    color: theme.palette.text.primary,
}));

const BigNumber = styled(Typography)(({ theme }) => ({
    fontSize: theme.spacing(5.5),
    color: theme.palette.text.primary,
}));

export const ChangeRequests = () => {
    const projectId = useRequiredPathParam('projectId');
    const { isOss, isPro } = useUiConfig();
    const { data } = useChangeRequestsCount(projectId);

    const { total, applied, rejected, reviewRequired, scheduled, approved } =
        data;
    const toBeApplied = scheduled + approved;

    if (isOss() || isPro()) {
        return (
            <Container>
                <Typography variant='h3'>Change requests</Typography>
                <PremiumFeature feature='change-requests' />
            </Container>
        );
    }

    return (
        <Container>
            <ChangeRequestNavigation
                to={`/projects/${projectId}/change-requests`}
            >
                <Typography variant='h3'>Change requests</Typography>
                <KeyboardArrowRight />
            </ChangeRequestNavigation>

            <BoxesContainer data-loading>
                <OpenBox>
                    <ChangeRequestNavigation
                        to={`/projects/${projectId}/change-requests`}
                    >
                        <span>Open</span>
                        <KeyboardArrowRight />
                    </ChangeRequestNavigation>
                    <ApplyBox>
                        <span>To be applied</span>
                        <MediumNumber>{toBeApplied}</MediumNumber>
                    </ApplyBox>
                    <ReviewBox>
                        <span>To be reviewed</span>
                        <MediumNumber>{reviewRequired}</MediumNumber>
                    </ReviewBox>
                </OpenBox>
                <NumberBox>
                    <Title>Total</Title>
                    <BigNumber>{total}</BigNumber>
                </NumberBox>
                <NumberBox>
                    <Title>Applied</Title>
                    <BigNumber>{applied}</BigNumber>
                </NumberBox>
                <NumberBox>
                    <Title>Rejected</Title>
                    <BigNumber>{rejected}</BigNumber>
                </NumberBox>
            </BoxesContainer>
        </Container>
    );
};
