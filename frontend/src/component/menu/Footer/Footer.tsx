/* eslint-disable react/jsx-no-target-blank */

import { VFC } from 'react';
import { List, ListItem, ListItemText, Grid } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ApiDetails } from './ApiDetails/ApiDetails';
import { useStyles } from './Footer.styles';
import { FooterTitle } from './FooterTitle';

export const Footer: VFC = () => {
    const { classes: styles } = useStyles();
    const { uiConfig } = useUiConfig();

    return (
        <footer className={styles.footer}>
            <Grid
                container
                justifyContent="center"
                spacing={10}
                style={{ marginBottom: 0 }}
            >
                <Grid item md={4} xs={12}>
                    <ApiDetails uiConfig={uiConfig} />
                </Grid>
                <Grid item xs={12} md="auto">
                    <Grid container spacing={7} direction="row">
                        <Grid item>
                            <section title="Unleash SDK">
                                <FooterTitle>Server SDKs</FooterTitle>
                                <List className={styles.list} dense>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/sdks/node_sdk"
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
                                <FooterTitle>Frontend SDKs</FooterTitle>
                                <List className={styles.list} dense>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/sdks/unleash-proxy"
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
                                <FooterTitle>About</FooterTitle>
                                <List className={styles.list} dense>
                                    <ListItem className={styles.listItem}>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://www.getunleash.io/"
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
