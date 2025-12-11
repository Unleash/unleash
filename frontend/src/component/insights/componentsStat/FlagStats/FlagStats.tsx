import Icon from '@mui/material/Icon';
import { Box, Typography, styled } from '@mui/material';
import { useId } from 'hooks/useId';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

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

const _StyledInsightsContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
    padding: theme.spacing(1.5, 2),
    background: theme.palette.background.elevation2,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    display: 'flex',
    alignItems: 'center',
}));

const _StyledHeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
}));

const _StyledTextContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
}));

const _StyledFlagCountPerUser = styled(Typography)(({ theme }) => ({
    marginLeft: 'auto',
    fontSize: theme.fontSizes.mainHeader,
}));

const _StyledIcon = styled(Icon)(({ theme }) => ({
    color: theme.palette.primary.main,
    width: '15px',
    height: '15px',
    marginRight: theme.spacing(0.5),
    fontSize: '15px!important',
}));

const LabelContainer = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
});

interface IFlagStatsProps {
    count: number;
    isLoading?: boolean;
}

export const FlagStats: React.FC<IFlagStatsProps> = ({ count, isLoading }) => {
    const labelId = useId();
    const descriptionId = useId();
    return (
        <>
            <StyledRingContainer>
                <StyledRing>
                    <StyledRingContent
                        aria-labelledby={labelId}
                        aria-describedby={descriptionId}
                    >
                        {isLoading ? (
                            <ScreenReaderOnly>
                                Loading total flag count
                            </ScreenReaderOnly>
                        ) : (
                            count
                        )}
                    </StyledRingContent>
                </StyledRing>
            </StyledRingContainer>

            <LabelContainer>
                <Typography id={labelId} variant='body2'>
                    Total number of flags
                </Typography>
                <HelpIcon
                    htmlTooltip
                    tooltipId={descriptionId}
                    tooltip={
                        'This includes the four lifecycle stages define, develop, production, and cleanup'
                    }
                >
                    <InfoOutlined />
                </HelpIcon>
            </LabelContainer>
        </>
    );
};
