import Icon from '@mui/material/Icon';
import { Box, Typography, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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
    padding: theme.spacing(1.5, 2),
    background: theme.palette.background.elevation2,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    display: 'flex',
    alignItems: 'center',
}));

const StyledHeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
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

const StyledIcon = styled(Icon)(({ theme }) => ({
    color: theme.palette.primary.main,
    width: '15px',
    height: '15px',
    marginRight: theme.spacing(0.5),
    fontSize: '15px!important',
}));

interface IFlagStatsProps {
    count: number;
    flagsPerUser?: string;
    isLoading?: boolean;
}

export const FlagStats: React.FC<IFlagStatsProps> = ({
    count,
    flagsPerUser,
    isLoading,
}) => {
    return (
        <>
            <StyledRingContainer>
                <StyledRing>
                    <StyledRingContent>
                        {isLoading ? '' : count}
                    </StyledRingContent>
                </StyledRing>
            </StyledRingContainer>

            <ConditionallyRender
                condition={flagsPerUser !== undefined && flagsPerUser !== ''}
                show={
                    <StyledInsightsContainer>
                        <StyledTextContainer>
                            <StyledHeaderContainer>
                                <StyledIcon>award_star</StyledIcon>
                                <Typography
                                    fontWeight='bold'
                                    variant='body2'
                                    color='primary'
                                >
                                    Insights
                                </Typography>
                            </StyledHeaderContainer>
                            <Typography variant='body2'>
                                Flags per user
                            </Typography>
                        </StyledTextContainer>
                        <StyledFlagCountPerUser>
                            {flagsPerUser}
                        </StyledFlagCountPerUser>
                    </StyledInsightsContainer>
                }
            />
        </>
    );
};
