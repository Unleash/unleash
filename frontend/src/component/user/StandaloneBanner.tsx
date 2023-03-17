import { FC } from 'react';
import { Typography, useTheme, useMediaQuery, styled } from '@mui/material';
import Gradient from 'component/common/Gradient/Gradient';
import { ReactComponent as Logo } from 'assets/icons/logoWhiteBg.svg';
import { ReactComponent as LogoWithText } from 'assets/img/logoWhiteTransparentHorizontal.svg';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Theme } from '@mui/material';

interface IStandaloneBannerProps {
    title: string;
}

const StyledGradient = styled(Gradient)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    borderTopLeftRadius: theme.shape.borderRadiusLarge,
    [theme.breakpoints.down('md')]: {
        borderTopLeftRadius: theme.shape.borderRadiusLarge,
        borderTopRightRadius: theme.shape.borderRadiusLarge,
    },
    [theme.breakpoints.down('sm')]: {
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0',
    },
}));

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(12, 8),
    color: theme.palette.common.white,
    position: 'relative',
    textAlign: 'right',
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(6, 4),
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(6, 2),
    },
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.common.white,
    marginBottom: theme.spacing(2),
    fontSize: theme.spacing(4),
    marginTop: theme.spacing(10),
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
    fontSize: theme.spacing(4),
    fontWeight: 'normal',
}));
const StyledLogoContainer = styled('div')(({ theme }) => ({
    position: 'absolute',
    [theme.breakpoints.up('md')]: {
        bottom: '-50px',
        left: '-50px',
        display: 'flex',
        flexDirection: 'column',
    },
    [theme.breakpoints.down('md')]: {
        top: '9px',
    },
}));

const logoStyles = (theme: Theme) => ({
    width: '200px',
    [theme.breakpoints.up('md')]: {
        width: '240px',
        height: '200px',
    },
});

const StyledLogoWithText = styled(LogoWithText)(({ theme }) => ({
    ...logoStyles(theme),
}));

const StyledLogo = styled(Logo)(({ theme }) => ({
    ...logoStyles(theme),
}));

const StandaloneBanner: FC<IStandaloneBannerProps> = ({ title }) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <StyledGradient
            from={theme.palette.loginGradient.from}
            to={theme.palette.loginGradient.to}
        >
            <StyledContainer>
                <StyledTitle variant="h1">{title}</StyledTitle>
                <StyledSubtitle>
                    Committed to creating new ways of developing software
                </StyledSubtitle>
            </StyledContainer>

            <StyledLogoContainer>
                <ConditionallyRender
                    condition={smallScreen}
                    show={<StyledLogoWithText aria-label="Unleash logo" />}
                    elseShow={<StyledLogo aria-label="Unleash logo" />}
                />
            </StyledLogoContainer>
        </StyledGradient>
    );
};

export default StandaloneBanner;
