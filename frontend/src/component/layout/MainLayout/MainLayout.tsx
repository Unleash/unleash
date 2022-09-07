import React, { ReactNode } from 'react';
import classnames from 'classnames';
import { makeStyles } from 'tss-react/mui';
import { Grid } from '@mui/material';
import { useStyles as useAppStyles } from 'component/App.styles';
import Header from 'component/menu/Header/Header';
import Footer from 'component/menu/Footer/Footer';
import Proclamation from 'component/common/Proclamation/Proclamation';
import BreadcrumbNav from 'component/common/BreadcrumbNav/BreadcrumbNav';
import textureImage from 'assets/img/texture.png';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { SkipNavLink } from 'component/common/SkipNav/SkipNavLink';
import { SkipNavTarget } from 'component/common/SkipNav/SkipNavTarget';
import { formatAssetPath } from 'utils/formatPath';

const useStyles = makeStyles()(theme => ({
    container: {
        height: '100%',
        justifyContent: 'space-between',
    },
    contentContainer: {
        height: '100%',
        padding: '3.25rem 0',
        position: 'relative',
        [theme.breakpoints.down('md')]: {
            padding: '3.25rem 0.75rem',
        },
    },
}));

interface IMainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: IMainLayoutProps) => {
    const { classes } = useStyles();
    const { classes: styles } = useAppStyles();
    const { uiConfig } = useUiConfig();

    return (
        <>
            <SkipNavLink />
            <Header />
            <SkipNavTarget />
            <Grid container className={classes.container}>
                <main className={classnames(styles.contentWrapper)}>
                    <Grid item className={styles.content} xs={12} sm={12}>
                        <div
                            className={classes.contentContainer}
                            style={{ zIndex: 200 }}
                        >
                            <BreadcrumbNav />
                            <Proclamation toast={uiConfig.toast} />
                            {children}
                        </div>
                    </Grid>
                    <img
                        src={formatAssetPath(textureImage)}
                        alt=""
                        style={{
                            display: 'block',
                            position: 'fixed',
                            zIndex: 0,
                            bottom: 0,
                            right: 0,
                            width: 400,
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }}
                    />
                </main>
                <Footer />
            </Grid>
        </>
    );
};
