import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { Route } from 'react-router-dom';
import { AppBar, Container, Typography, IconButton } from '@material-ui/core';
import { DrawerMenu } from '../drawer';
import MenuIcon from '@material-ui/icons/Menu';
import Breadcrumb from '../breadcrumb';
import ShowUserContainer from '../../user/show-user-container';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';

import { useStyles } from './styles';

const Header = ({ uiConfig, init }) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const styles = useStyles();
    const [openDrawer, setOpenDrawer] = useState(false);

    useEffect(() => {
        init(uiConfig.flags);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleDrawer = () => setOpenDrawer(prev => !prev);

    const { links, name, flags } = uiConfig;

    return (
        <React.Fragment>
            <AppBar className={styles.header} position="static">
                <Container className={styles.container}>
                    <IconButton className={styles.drawerButton} onClick={toggleDrawer}>
                        <MenuIcon />
                    </IconButton>
                    <ConditionallyRender
                        condition={!smallScreen}
                        show={
                            <Typography variant="h1" className={styles.headerTitle}>
                                <Route path="/:path" component={Breadcrumb} />
                            </Typography>
                        }
                    />

                    <div className={styles.userContainer}>
                        <ShowUserContainer />
                    </div>
                    <DrawerMenu
                        links={links}
                        title={name}
                        flags={flags}
                        open={openDrawer}
                        toggleDrawer={toggleDrawer}
                    />
                </Container>
            </AppBar>
        </React.Fragment>
    );
};

Header.propTypes = {
    uiConfig: PropTypes.object.isRequired,
    init: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
};

export default Header;
