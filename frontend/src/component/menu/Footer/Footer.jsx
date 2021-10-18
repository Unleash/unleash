/* eslint-disable react/jsx-no-target-blank */

import { List, ListItem, ListItemText, Grid } from '@material-ui/core';

import ShowApiDetailsContainer from '../../api/show-api-details-container';

import { useStyles } from './Footer.styles';

export const Footer = () => {
    const styles = useStyles();

    return (
        <footer className={styles.footer}>
            <Grid container justifyContent="center" spacing={10}>
                <Grid item md={4} xs={12}>
                    <ShowApiDetailsContainer />
                </Grid>
                <Grid item xs={12} md="auto">
                    <Grid container spacing={7} direction="row">
                        <Grid item>
                            <section title="Unleash SDK">
                                <h4>Server SDKs</h4>
                                <List className={styles.list} dense>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/sdks/node_sdk"
                                                    className={styles.link}
                                                    target="_blank"
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
                                                    href="https://docs.getunleash.io/sdks/java_sdk"
                                                    className={styles.link}
                                                    target="_blank"
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
                                                    href="https://docs.getunleash.io/sdks/go_sdk"
                                                    className={styles.link}
                                                    target="_blank"
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
                                                    href="https://docs.getunleash.io/sdks/ruby_sdk"
                                                    className={styles.link}
                                                    target="_blank"
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
                                                    href="https://docs.getunleash.io/sdks/python_sdk"
                                                    className={styles.link}
                                                    target="_blank"
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
                                                    href="https://docs.getunleash.io/sdks/dot_net_sdk"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    .NET
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/sdks/php_sdk"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    PHP
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/sdks"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    All SDKs
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                </List>
                            </section>
                        </Grid>
                        <Grid item>
                            <section title="Unleash SDK">
                                <h4>Frontend SDKs</h4>
                                <List className={styles.list} dense>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/sdks/unleash-proxy"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    Unleash Proxy
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/sdks/proxy-javascript"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    JavaScript SDK
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/sdks/proxy-react"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    React SDK
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/sdks/proxy-ios"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    iOS SDK
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/sdks/android_proxy_sdk"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    Android SDK
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                </List>
                            </section>
                        </Grid>
                        <Grid item>
                            <section>
                                <h4>About</h4>
                                <List className={styles.list} dense>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://www.getunleash.io/"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    getunleash.io
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://twitter.com/getunleash"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    Twitter
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://www.linkedin.com/company/getunleash"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    LinkedIn
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://github.com/Unleash/unleash"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    GitHub
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://slack.unleash.run"
                                                    className={styles.link}
                                                    target="_blank"
                                                >
                                                    Slack Community
                                                </a>
                                            }
                                        />
                                    </ListItem>
                                </List>
                            </section>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </footer>
    );
};

export default Footer;
