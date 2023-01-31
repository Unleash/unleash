import { ArrowOutward, SouthEast } from '@mui/icons-material';
import { Box, Typography, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { flexRow } from 'themes/themeStyles';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4, 2),
    backgroundColor: theme.palette.background.paper,
    minWidth: '24%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    [theme.breakpoints.down('lg')]: {
        minWidth: '49%',
        padding: theme.spacing(2),
        ':nth-child(n+3)': {
            marginTop: theme.spacing(2),
        },
    },
    [theme.breakpoints.down('sm')]: {
        ':nth-child(n+2)': {
            marginTop: theme.spacing(2),
        },
    },
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

const StyledTypographyChange = styled(Typography)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    fontSize: theme.fontSizes.smallBody,
}));

interface IStatusBoxProps {
    title: string;
    boxText: string;
    change: number;
    percentage?: boolean;
    fullWidthBodyText?: boolean;
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

export const StatusBox = ({
    title,
    boxText,
    change,
    percentage,
    fullWidthBodyText,
}: IStatusBoxProps) => {
    return (
        <StyledBox>
            <StyledTypographyHeader>{title}</StyledTypographyHeader>
            <Box
                sx={{
                    ...flexRow,
                    justifyContent: fullWidthBodyText
                        ? 'space-between'
                        : 'center',
                    width: fullWidthBodyText ? '65%' : 'auto',
                }}
            >
                <StyledTypographyCount>{boxText}</StyledTypographyCount>
                <ConditionallyRender
                    condition={change !== 0}
                    show={
                        <StyledBoxChangeContainer>
                            <Box
                                sx={{
                                    ...flexRow,
                                }}
                            >
                                {resolveIcon(change)}
                                <StyledTypographyChange
                                    color={resolveColor(change)}
                                >
                                    {change}
                                    {percentage ? '%' : ''}
                                </StyledTypographyChange>
                            </Box>
                            <StyledTypographySubtext>
                                this month
                            </StyledTypographySubtext>
                        </StyledBoxChangeContainer>
                    }
                    elseShow={
                        <StyledBoxChangeContainer>
                            <StyledTypographySubtext>
                                No change
                            </StyledTypographySubtext>
                        </StyledBoxChangeContainer>
                    }
                />
            </Box>
        </StyledBox>
    );
};
