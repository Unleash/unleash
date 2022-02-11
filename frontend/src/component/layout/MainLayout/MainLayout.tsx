import React, { ReactNode } from 'react';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import styles from '../../styles.module.scss';
import Header from '../../menu/Header/Header';
import Footer from '../../menu/Footer/Footer';
import Proclamation from '../../common/Proclamation/Proclamation';
import BreadcrumbNav from '../../common/BreadcrumbNav/BreadcrumbNav';
import { ReactComponent as Texture } from '../../../assets/img/texture.svg';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';

const useStyles = makeStyles(theme => ({
    container: {
        height: '100%',
        justifyContent: 'space-between',
    },
    contentContainer: {
        height: '100%',
        padding: '3.25rem 0',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            padding: '3.25rem 0.75rem',
        },
    },
}));

interface IMainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: IMainLayoutProps) => {
    const muiStyles = useStyles();
    const { uiConfig } = useUiConfig();

    return (
        <>
            <Header />
            <Grid container className={muiStyles.container}>
                <div className={classnames(styles.contentWrapper)}>
                    <Grid item className={styles.content} xs={12} sm={12}>
                        <div
                            className={muiStyles.contentContainer}
                            style={{ zIndex: 200 }}
                        >
                            <BreadcrumbNav />
                            <Proclamation toast={uiConfig.toast} />
                            {children}
                        </div>
                    </Grid>
                    <div style={{ overflow: 'hidden' }}>
                        <div
                            style={{
                                position: 'fixed',
                                right: '0',
                                bottom: '-4px',
                                zIndex: 1,
                            }}
                        >
                            <Texture />
                        </div>
                    </div>
                </div>
                <Footer />
            </Grid>
        </>
    );
};
