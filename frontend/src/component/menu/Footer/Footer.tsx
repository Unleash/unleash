/* eslint-disable react/jsx-no-target-blank */

import { VFC } from 'react';
import { List, ListItem, ListItemText, Grid, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ApiDetails } from './ApiDetails/ApiDetails';
import { FooterTitle } from './FooterTitle';
import { focusable } from 'themes/themeStyles';

const StyledFooter = styled('footer')(({ theme }) => ({
    padding: theme.spacing(4, 8),
    width: '100%',
    flexGrow: 1,
    zIndex: 100,
    backgroundColor: theme.palette.background.paper,
}));

const StyledList = styled(List)({
    padding: 0,
    margin: 0,
});

const StyledListItem = styled(ListItem)(({ theme }) => ({
    padding: 0,
    margin: 0,
    '& a': {
        ...focusable(theme),
        textDecoration: 'none',
        color: theme.palette.text.primary,
        '&:hover': {
            textDecoration: 'underline',
        },
    },
}));

export const Footer: VFC = () => {
    const { uiConfig } = useUiConfig();

    return (
        <StyledFooter>
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
                                <StyledList dense>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/node"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Node.js
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/java"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Java
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/go"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Go
                                                </a>
                                            }
                                        />
                                    </StyledListItem>{' '}
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/rust"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Rust
                                                </a>
                                            }
                                        />
                                    </StyledListItem>{' '}
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/ruby"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Ruby
                                                </a>
                                            }
                                        />
                                    </StyledListItem>{' '}
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/python"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Python
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/dotnet"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    .NET
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/php"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    PHP
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    All SDKs
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                </StyledList>
                            </section>
                        </Grid>
                        <Grid item>
                            <section title="Unleash SDK">
                                <FooterTitle>Frontend SDKs</FooterTitle>
                                <StyledList dense>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/unleash-proxy"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Unleash Proxy
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/javascript-browser"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    JavaScript
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/react"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    React
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/next-js"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Next.js
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/vue"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Vue
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/ios-proxy"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    iOS
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/android-proxy"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Android
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://docs.getunleash.io/reference/sdks/flutter"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Flutter
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                </StyledList>
                            </section>
                        </Grid>
                        <Grid item>
                            <section>
                                <FooterTitle>About</FooterTitle>
                                <StyledList dense>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://www.getunleash.io/"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    getunleash.io
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://twitter.com/getunleash"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Twitter
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://www.linkedin.com/company/getunleash"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    LinkedIn
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://github.com/Unleash/unleash"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    GitHub
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                    <StyledListItem>
                                        <ListItemText
                                            primary={
                                                <a
                                                    href="https://slack.unleash.run"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Slack Community
                                                </a>
                                            }
                                        />
                                    </StyledListItem>
                                </StyledList>
                            </section>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </StyledFooter>
    );
};

export default Footer;
