import { Settings } from '@mui/icons-material';
import { Box, Typography, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

const StyledContent = styled(Box)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    backgroundColor: theme.palette.background.paper,
    maxWidth: 300,
    padding: theme.spacing(3),
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    fontSize: theme.fontSizes.bodySize,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
}));

const StyledRingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledRing = styled(Box)(({ theme }) => ({
    borderRadius: '50%',
    width: '200px',
    height: '200px',
    border: `10px solid ${theme.palette.secondary.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledRingContent = styled(Box)(({ theme }) => ({
    borderRadius: '50%',
    width: '180px',
    height: '180px',
    backgroundColor: theme.palette.secondary.light,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: theme.fontSizes.extraLargeHeader,
    border: `10px solid ${theme.palette.background.paper}`,
}));

const StyledInsightsContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
    padding: theme.spacing(1.5),
    background: theme.palette.background.elevation2,
    borderRadius: `${theme.shape.borderRadius}px`,
    display: 'flex',
    alignItems: 'center',
}));

const StyledHeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

const StyledTextContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
}));

const StyledFlagCountPerUser = styled(Typography)(({ theme }) => ({
    marginLeft: 'auto',
    fontSize: theme.fontSizes.mainHeader,
}));

const StyledSettingsIcon = styled(Settings)(({ theme }) => ({
    color: theme.palette.primary.main,
    width: '15px',
    height: '15px',
    marginRight: theme.spacing(0.5),
}));

interface IFlagStatsProps {
    count: number;
    flagsPerUser: string;
}

export const FlagStats: React.FC<IFlagStatsProps> = ({
    count,
    flagsPerUser,
}) => {
    return (
        <>
            <StyledRingContainer>
                <StyledRing>
                    <StyledRingContent>{count}</StyledRingContent>
                </StyledRing>
            </StyledRingContainer>

            <StyledInsightsContainer>
                <StyledTextContainer>
                    <StyledHeaderContainer>
                        <StyledSettingsIcon />
                        <Typography
                            fontWeight='bold'
                            variant='body2'
                            color='primary'
                        >
                            Insights
                        </Typography>
                    </StyledHeaderContainer>
                    <Typography variant='body2'>Flags per user</Typography>
                </StyledTextContainer>
                <StyledFlagCountPerUser>{flagsPerUser}</StyledFlagCountPerUser>
            </StyledInsightsContainer>
        </>
    );
};
