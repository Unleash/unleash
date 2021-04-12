import React from 'react';

import { List, ListItem, ListItemText, Grid } from '@material-ui/core';

import ShowApiDetailsContainer from '../../api/show-api-details-container';

import { useStyles } from './Footer.styles';

export const Footer = () => {
    const styles = useStyles();

    return (
        <footer className={styles.footer}>
            <Grid container>
                <Grid item xs={3}>
                    <section title="Client SDKs">
                        <h4>Client SDKs</h4>
                        <List className={styles.list}>
                            <ListItem className={styles.listItem}>
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
                            <ListItem className={styles.listItem}>
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
                            </ListItem>
                            <ListItem className={styles.listItem}>
                                <ListItemText
                                    primary={
                                        <a
                                            href="https://github.com/Unleash/unleash-client-go"
                                            className={styles.link}
                                        >
                                            Go
                                        </a>
                                    }
                                />
                            </ListItem>{' '}
                            <ListItem className={styles.listItem}>
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
                            <ListItem className={styles.listItem}>
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
                            <ListItem className={styles.listItem}>
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
                            <ListItem className={styles.listItem}>
                                <ListItemText
                                    primary={
                                        <a
                                            href="https://unleash.github.io/docs/client_sdk"
                                            className={styles.link}
                                        >
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
    );
};

export default Footer;
