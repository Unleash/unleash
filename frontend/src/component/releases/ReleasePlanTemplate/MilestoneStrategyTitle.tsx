import { Box, Typography, styled } from '@mui/material';
import Input from 'component/common/Input/Input';

const StyledBox = styled(Box)(({ theme }) => ({
    paddingBottom: theme.spacing(2),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    paddingBottom: theme.spacing(2),
}));

interface IMilestoneStrategyTitleProps {
    title: string;
    setTitle: (title: string) => void;
}

export const MilestoneStrategyTitle = ({
    title,
    setTitle,
}: IMilestoneStrategyTitleProps) => {
    return (
        <StyledBox>
            <StyledTypography>
                What would you like to call this strategy? (optional)
            </StyledTypography>
            <Input
                label='Strategy title'
                id='title-input'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ width: '100%' }}
            />
        </StyledBox>
    );
};
