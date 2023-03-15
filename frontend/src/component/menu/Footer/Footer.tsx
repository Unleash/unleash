/* eslint-disable react/jsx-no-target-blank */

import { VFC } from 'react';
import { List, ListItem, ListItemText, Grid, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ApiDetails } from './ApiDetails/ApiDetails';
import { FooterTitle } from './FooterTitle';

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
                                                    href="https://docs.getunleash.io/reference/sdks/ruby"
                                                    target="_blank"
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
                                                >
                                                    JavaScript SDK
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
                                                >
                                                    React SDK
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
                                                >
                                                    iOS SDK
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
                                                >
                                                    Android SDK
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
