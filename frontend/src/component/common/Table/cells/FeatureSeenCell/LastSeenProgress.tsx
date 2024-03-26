import { styled, CircularProgress, Box } from '@mui/material';

const ProgressContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    width: '20%',
    justifyContent: 'flex-end',
}));

const BackgroundCircularProgress = styled(CircularProgress)(({ theme }) => ({
    color: theme.palette.divider,
}));

const MainCircularProgress = styled(CircularProgress)(({ theme }) => ({
    color: theme.palette.primary.main,
    position: 'absolute',
    left: 0,
}));

interface ILastSeenProgressProps {
    yes: number | undefined;
    no: number | undefined;
}

export const LastSeenProgress = ({ yes, no }: ILastSeenProgressProps) => {
    const noData = yes === undefined || no === undefined || yes + no === 0;
    if (noData) {
        return <Box />;
    }

    const progress = (yes / (yes + no)) * 100;
    return (
        <ProgressContainer>
            <Box sx={{ position: 'relative' }}>
                <BackgroundCircularProgress
                    variant='determinate'
                    size={18}
                    thickness={11}
                    value={100}
                />
                <MainCircularProgress
                    variant='determinate'
                    disableShrink
                    size={18}
                    thickness={11}
                    value={progress}
                />
            </Box>
            <Box>{progress}%</Box>
        </ProgressContainer>
    );
};
