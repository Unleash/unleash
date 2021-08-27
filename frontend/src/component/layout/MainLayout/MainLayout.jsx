import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';

import styles from '../../styles.module.scss';
import ErrorContainer from '../../error/error-container';
import Header from '../../menu/Header/Header';
import Footer from '../../menu/Footer/Footer';
import Proclamation from '../../common/Proclamation/Proclamation';
import BreadcrumbNav from '../../common/BreadcrumbNav/BreadcrumbNav';
import { ReactComponent as Texture } from '../../../assets/img/texture.svg';

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

const MainLayout = ({ children, location, uiConfig }) => {
    const muiStyles = useStyles();

    return (
        <>
            <Header location={location} />
            <Grid container className={muiStyles.container}>
                <div className={classnames(styles.contentWrapper)}>
                    <Grid item className={styles.content} xs={12} sm={12}>
                        <div
                            className={muiStyles.contentContainer}
                            style={{ zIndex: '100' }}
                        >
                            <BreadcrumbNav />
                            <Proclamation toast={uiConfig.toast} />
                            {children}
                        </div>
                        <ErrorContainer />
                    </Grid>
                    <div style={{ overflow: 'hidden' }}>
                        <div
                            style={{
                                position: 'fixed',
                                right: '0',
                                bottom: '-4px',
                                zIndex: '1',
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

MainLayout.propTypes = {
    location: PropTypes.object.isRequired,
};

export default MainLayout;
