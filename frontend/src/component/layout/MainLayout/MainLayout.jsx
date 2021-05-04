import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';

import styles from '../../styles.module.scss';
import ErrorContainer from '../../error/error-container';
import Header from '../../menu/Header';
import Footer from '../../menu/Footer/Footer';
import Proclamation from '../../common/Proclamation/Proclamation';

const useStyles = makeStyles(theme => ({
    container: {
        height: '100%',
        justifyContent: 'space-between',
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
                        <div className={styles.contentContainer}>
                            <Proclamation toast={uiConfig.toast} />
                            {children}
                        </div>
                        <ErrorContainer />
                    </Grid>
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
