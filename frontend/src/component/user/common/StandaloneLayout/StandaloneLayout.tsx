import { FC } from 'react';
import StandaloneBanner from '../../StandaloneBanner/StandaloneBanner';

import { Typography } from '@material-ui/core';

import { useStyles } from './StandaloneLayout.styles';
import ConditionallyRender from '../../../common/ConditionallyRender';
import { Link, useLocation } from 'react-router-dom';

interface IStandaloneLayout {
    BannerComponent?: JSX.Element;
    showMenu?: boolean;
}

const StandaloneLayout: FC<IStandaloneLayout> = ({
    children,
    showMenu = true,
    BannerComponent,
}) => {
    const styles = useStyles();
    const location = useLocation();

    let banner = (
        <StandaloneBanner title="Unleash">
            <Typography variant="subtitle1" className={styles.bannerSubtitle}>
                Committed to creating new ways of developing software.
            </Typography>
        </StandaloneBanner>
    );

    if (BannerComponent) {
        banner = BannerComponent;
    }

    const isLoginpage = location.pathname.includes('login');

    return (
        <div className={styles.container}>
            <div className={styles.leftContainer}>{banner}</div>
            <div className={styles.rightContainer}>
                <ConditionallyRender
                    condition={showMenu && !isLoginpage}
                    show={
                        <div className={styles.menu}>
                            <Link to="/login">Login</Link>
                        </div>
                    }
                />

                <div className={styles.innerRightContainer}>{children}</div>
            </div>
        </div>
    );
};

export default StandaloneLayout;
