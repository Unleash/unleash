import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/styles';
import { Grid, Container } from '@material-ui/core';

import styles from '../styles.module.scss';
import ErrorContainer from '../error/error-container';
import Header from '../menu/Header';
import Footer from '../menu/Footer/Footer';

const useStyles = makeStyles(theme => ({
    footer: {
        background: theme.palette.neutral.main,
        padding: '2rem 4rem',
        color: '#fff',
        width: '100%',
    },
    container: {
        height: '100%',
        justifyContent: 'space-between',
    },
}));

const Layout = ({ children, location }) => {
    const muiStyles = useStyles();

    return (
        <>
            <Header location={location} />
            <Grid container className={muiStyles.container}>
                <div className={classnames(styles.contentWrapper)}>
                    <Grid item className={styles.content} xs={12} sm={12}>
                        <div className={styles.contentContainer}>{children}</div>
                        <ErrorContainer />
                    </Grid>
                </div>
                <div className={muiStyles.footer}>
                    <Container>
                        <Footer />
                    </Container>
                </div>
            </Grid>
        </>
    );
};

Layout.propTypes = {
    location: PropTypes.object.isRequired,
};

export default Layout;
