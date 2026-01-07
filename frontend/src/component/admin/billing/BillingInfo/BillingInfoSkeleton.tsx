import { Paper, styled } from '@mui/material';

const StyledWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusLarge,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: theme.typography.body2.fontSize,
}));

const SkeletonBox = styled('div')(({ theme }) => ({
    height: theme.spacing(2.5),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0.5, 0),
}));

const SkeletonTitle = styled('div')(({ theme }) => ({
    height: theme.spacing(4),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0.5, 0),
    width: theme.spacing(20),
}));

const SkeletonButton = styled('div')(({ theme }) => ({
    height: theme.spacing(5),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(1, 0),
    width: '100%',
}));

const SkeletonDivider = styled('div')(({ theme }) => ({
    height: theme.spacing(0.125),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(1.5, 0),
    width: '100%',
}));

const SkeletonText = styled('div')(({ theme }) => ({
    height: theme.spacing(2),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0.5, 0),
    width: theme.spacing(25),
}));

export const BillingInfoSkeleton = () => {
    return (
        <StyledWrapper data-loading>
            <SkeletonTitle />
            <StyledRow>
                <SkeletonBox sx={{ width: (theme) => theme.spacing(12) }} />
                <SkeletonBox sx={{ width: (theme) => theme.spacing(8) }} />
            </StyledRow>
            <StyledRow>
                <SkeletonBox sx={{ width: (theme) => theme.spacing(10) }} />
                <SkeletonBox sx={{ width: (theme) => theme.spacing(6) }} />
            </StyledRow>
            <SkeletonDivider />
            <SkeletonButton />
            <SkeletonText />
            <SkeletonText sx={{ width: (theme) => theme.spacing(20) }} />
        </StyledWrapper>
    );
};
