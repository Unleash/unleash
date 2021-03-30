import React from 'react';
import { NavLink } from 'react-router-dom';

import { List, ListItem, ListItemText, Grid } from '@material-ui/core';
import { baseRoutes as routes } from '../../menu/routes';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import ShowApiDetailsContainer from '../../api/show-api-details-container';

import styles from './Footer.module.scss';

export const Footer = () => (
    <React.Fragment>
        <footer>
            <Grid container>
                <Grid item xs={3}>
                    <section title="Menu">
                        <h4>Menu</h4>
                        <List className={styles.list}>
                            <ConditionallyRender
                                condition={routes && routes.length > 0}
                                show={routes.map(route => (
                                    <ListItem key={`listitem_${route.path}`} className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <NavLink key={route.path} to={route.path} className={styles.link}>
                                                    {route.title}
                                                </NavLink>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            />
                            <ListItem key="github_link" className={styles.listItem}>
                                <ListItemText
                                    primary={
                                        <a href="https://github.com/Unleash/unleash/" target="_blank">
                                            GitHub
                                        </a>
                                    }
                                />
                            </ListItem>
                        </List>
                    </section>
                </Grid>
                <Grid item xs={3}>
                    <section title="Client SDKs">
                        <h4>Client SDKs</h4>
                        <List className={styles.list}>
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <a
                                            href="https://github.com/Unleash/unleash-client-node"
                                            className={styles.link}
                                        >
                                            Node.js
                                        </a>
                                    }
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <a
                                            href="https://github.com/Unleash/unleash-client-java"
                                            className={styles.link}
                                        >
                                            Java
                                        </a>
                                    }
                                />
                            </ListItem>{' '}
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <a href="https://github.com/Unleash/unleash-client-go" className={styles.link}>
                                            Go
                                        </a>
                                    }
                                />
                            </ListItem>{' '}
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <a
                                            href="https://github.com/Unleash/unleash-client-ruby"
                                            className={styles.link}
                                        >
                                            Ruby
                                        </a>
                                    }
                                />
                            </ListItem>{' '}
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <a
                                            href="https://github.com/Unleash/unleash-client-python"
                                            className={styles.link}
                                        >
                                            Python
                                        </a>
                                    }
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <a
                                            href="https://github.com/Unleash/unleash-client-core"
                                            className={styles.link}
                                        >
                                            .Net Core
                                        </a>
                                    }
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <a href="https://unleash.github.io/docs/client_sdk" className={styles.link}>
                                            All client SDKs
                                        </a>
                                    }
                                />
                            </ListItem>
                        </List>
                    </section>
                </Grid>
                <Grid item xs={12}>
                    <ShowApiDetailsContainer />
                </Grid>
            </Grid>
        </footer>
    </React.Fragment>
);

export default Footer;
