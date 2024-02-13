import { Typography, styled } from '@mui/material';
import { Gauge } from '../Gauge/Gauge';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    textAlign: 'center',
}));

const StyledText = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(-7),
    display: 'flex',
    flexDirection: 'column',
}));

export const TimeToProduction = () => {
    return (
        <StyledContainer>
            <Gauge value={90} />
            <StyledText>
                <Typography variant='h2' component='div'>
                    3 weeks
                </Typography>
                <Typography
                    variant='body2'
                    sx={(theme) => ({
                        color: theme.palette.primary.main,
                    })}
                >
                    Medium
                </Typography>
            </StyledText>
        </StyledContainer>
    );
};
