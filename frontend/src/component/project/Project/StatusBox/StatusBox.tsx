import { ArrowOutward, SouthEast } from '@mui/icons-material';
import { Box, Typography, styled } from '@mui/material';
import { flexRow } from 'themes/themeStyles';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4, 2),
    backgroundColor: theme.palette.background.paper,
    minWidth: '240px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

const StyledTypographyHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const StyledTypographyCount = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.largeHeader,
    fontWeight: 'bold',
}));

const StyledBoxChangeContainer = styled(Box)(({ theme }) => ({
    ...flexRow,
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: theme.spacing(1.5),
}));

const StyledTypographySubtext = styled(Typography)(({ theme }) => ({
    color: theme.palette.neutral.main,
    fontSize: theme.fontSizes.smallBody,
}));

interface IStatusBoxProps {
    title: string;
    boxText: string;
    change: number;
}

const resolveIcon = (change: number) => {
    if (change > 0) {
        return (
            <ArrowOutward
                sx={{ color: 'success.main', height: 18, width: 18 }}
            />
        );
    }
    return <SouthEast sx={{ color: 'warning.dark', height: 18, width: 18 }} />;
};

const resolveColor = (change: number) => {
    if (change > 0) {
        return 'success.main';
    }
    return 'error.main';
};

export const StatusBox = ({ title, boxText, change }: IStatusBoxProps) => {
    return (
        <StyledBox>
            <StyledTypographyHeader>{title}</StyledTypographyHeader>
            <Box sx={{ display: 'flex' }}>
                <StyledTypographyCount>{boxText}</StyledTypographyCount>
                <StyledBoxChangeContainer>
                    <Box sx={{ ...flexRow }}>
                        {resolveIcon(change)}
                        <Typography
                            sx={theme => ({
                                marginLeft: theme.spacing(1),
                                fontSize: theme.fontSizes.smallBody,
                            })}
                            color={resolveColor(change)}
                        >
                            {change}
                        </Typography>
                    </Box>
                    <StyledTypographySubtext>
                        this month
                    </StyledTypographySubtext>
                </StyledBoxChangeContainer>
            </Box>
        </StyledBox>
    );
};
