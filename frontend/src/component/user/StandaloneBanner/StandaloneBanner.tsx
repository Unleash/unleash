import { FC } from 'react';
import { Typography, useTheme, useMediaQuery } from '@material-ui/core';
import Gradient from '../../common/Gradient/Gradient';
import { ReactComponent as Logo } from '../../../assets/icons/logo-white-bg.svg';
import { ReactComponent as LogoWithText } from '../../../assets/img/Logo_White_Transparent_Horizontal.svg';
import { useStyles } from './StandaloneBanner.styles';
import ConditionallyRender from '../../common/ConditionallyRender';

interface IStandaloneBannerProps {
    title: string;
}

const StandaloneBanner: FC<IStandaloneBannerProps> = ({ title, children }) => {
    const theme = useTheme();
    const styles = useStyles();
    const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    console.log(smallScreen);

    return (
        <Gradient
            from={theme.palette.primary.main}
            to={theme.palette.login.gradient.bottom}
            className={styles.gradient}
        >
            <div className={styles.container}>
                <Typography variant="h1" className={styles.title}>
                    {title}
                </Typography>
                <Typography className={styles.bannerSubtitle}>
                    Committed to creating new ways of developing software
                </Typography>
            </div>

            <div className={styles.logoContainer}>
                <ConditionallyRender
                    condition={smallScreen}
                    show={<LogoWithText className={styles.logo} />}
                    elseShow={<Logo className={styles.logo} />}
                />
            </div>
        </Gradient>
    );
};

export default StandaloneBanner;
