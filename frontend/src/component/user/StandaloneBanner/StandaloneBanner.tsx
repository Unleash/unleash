import { FC } from 'react';

import { Typography, useTheme } from '@material-ui/core';
import Gradient from '../../common/Gradient/Gradient';

import { ReactComponent as Logo } from '../../../assets/icons/logo-white-bg.svg';

import { useStyles } from './StandaloneBanner.styles';

interface IStandaloneBannerProps {
    title: string;
}

const StandaloneBanner: FC<IStandaloneBannerProps> = ({ title, children }) => {
    const theme = useTheme();
    const styles = useStyles();
    return (
        <Gradient
            from={theme.palette.primary.main}
            to={theme.palette.login.gradient.bottom}
            style={{
                borderBottomLeftRadius: '3px',
                borderTopLeftRadius: '3px',
            }}
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
                <Logo className={styles.logo} />
            </div>
        </Gradient>
    );
};

export default StandaloneBanner;
