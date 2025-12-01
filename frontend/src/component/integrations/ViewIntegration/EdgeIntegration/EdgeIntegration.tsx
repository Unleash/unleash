import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { Divider, Typography, styled } from '@mui/material';
import edgeMode from './assets/edge-mode.svg';
import offlineMode from './assets/edge-offline.svg';
import edgeChaining from './assets/edge-daisy-chaining.svg';
import LaunchIcon from '@mui/icons-material/Launch';
import { IntegrationHowToSection } from 'component/integrations/IntegrationHowToSection/IntegrationHowToSection';
import { formatAssetPath } from 'utils/formatPath';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledDescription = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledGrayContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledDescriptionHeader = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const StyledLink = styled('a')({
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
});

const StyledFigure = styled('figure')(({ theme }) => ({
    display: 'flex',
    marginLeft: 0,
    marginRight: 0,
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
    gap: theme.spacing(1),
    flexDirection: 'column',
}));

const StyledFigcaption = styled('figcaption')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
    textAlign: 'center',
}));

export const EDGE_INFO = {
    name: 'unleash',
    displayName: 'Unleash Edge',
    description: 'Unleash Edge is the successor to the Unleash Proxy.',
    documentationUrl: 'https://docs.getunleash.io/concepts/unleash-edge',
    howTo: `Unleash Edge sits between the Unleash API and your SDKs and provides a cached read-replica of your Unleash instance. This means you can scale up your Unleash instance to thousands of connected SDKs without increasing the number of requests you make to your Unleash instance.
Unleash Edge offers two important features:
  - **Performance:** Unleash Edge caches in memory and can run close to your end-users. A single instance can handle tens to hundreds of thousands of requests per second.
  - **Resilience:** Unleash Edge is designed to survive restarts and operate properly even if you lose connection to your Unleash server.`,
};

export const EdgeIntegration = () => {
    const { displayName, description, documentationUrl } = EDGE_INFO;

    return (
        <FormTemplate
            title={`${displayName}`}
            description={description || ''}
            documentationLink={documentationUrl}
            documentationLinkLabel='Unleash Edge documentation'
        >
            <StyledContainer>
                <IntegrationHowToSection
                    provider={EDGE_INFO}
                    title='Why would you need Edge?'
                />
                <StyledGrayContainer>
                    <StyledLink
                        target='_blank'
                        rel='noopener noreferrer'
                        href='https://github.com/Unleash/unleash-edge#readme'
                    >
                        View Unleash Edge on GitHub{' '}
                        <LaunchIcon
                            fontSize='inherit'
                            sx={{
                                verticalAlign: 'middle',
                                marginBottom: '2px',
                            }}
                        />
                    </StyledLink>
                </StyledGrayContainer>
                <Divider
                    sx={(theme) => ({
                        marginTop: theme.spacing(2),
                        marginBottom: theme.spacing(2),
                    })}
                />
                <iframe
                    src='https://www.youtube-nocookie.com/embed/6uIdF-yByWs?si=rPzsFCM_2IheaTUo'
                    title='YouTube video player'
                    frameBorder='0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                    allowFullScreen
                    style={{
                        width: '100%',
                        aspectRatio: '16/9',
                    }}
                />
                <StyledDescription>
                    <section>
                        <StyledDescriptionHeader variant='h3'>
                            Modes
                        </StyledDescriptionHeader>
                        <Typography variant='body1'>
                            Edge currently supports 2 different modes:{' '}
                            <ul>
                                <li>
                                    <a
                                        href='https://docs.getunleash.io/concepts/unleash-edge#edge'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        Edge
                                    </a>{' '}
                                    Edge &ndash; Connection to upstream node
                                    (Unleash instance or another Edge). Supports
                                    dynamic tokens, metrics and other advanced
                                    features;
                                </li>
                                <li>
                                    <a
                                        href='https://docs.getunleash.io/concepts/unleash-edge#offline'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        Offline
                                    </a>{' '}
                                    &ndash; No connection to upstream node. Full
                                    control of data and tokens;
                                </li>
                            </ul>
                        </Typography>
                    </section>
                    <section>
                        <StyledDescriptionHeader variant='h3'>
                            Edge
                        </StyledDescriptionHeader>
                        <Typography variant='body1'>
                            Edge mode is the "standard" mode for Unleash Edge
                            and the one you should default to in most cases. It
                            connects to an upstream node, such as your Unleash
                            instance, and uses that as the source of truth for
                            feature flags.
                        </Typography>
                        <StyledFigure>
                            <img src={formatAssetPath(edgeMode)} alt='test' />
                            <StyledFigcaption>Edge mode</StyledFigcaption>
                        </StyledFigure>
                        <Typography>
                            Other than connecting Edge directly to your Unleash
                            instance, it's also possible to connect to another
                            Edge instance (daisy chaining). You can have as many
                            Edge nodes as you'd like between the Edge node your
                            clients are accessing and the Unleash server, and
                            it's also possible for multiple nodes to connect to
                            a single upstream one.
                        </Typography>
                        <StyledFigure>
                            <img
                                src={formatAssetPath(edgeChaining)}
                                alt='test'
                            />
                            <StyledFigcaption>
                                Edge daisy chaining
                            </StyledFigcaption>
                        </StyledFigure>
                    </section>
                    <section>
                        <StyledDescriptionHeader variant='h3'>
                            Offline
                        </StyledDescriptionHeader>
                        <Typography>
                            Offline mode is useful when there is no connection
                            to an upstream node, such as your Unleash instance
                            or another Edge instance, or as a tool to make
                            working with Unleash easier during development.
                        </Typography>
                        <StyledFigure>
                            <img
                                src={formatAssetPath(offlineMode)}
                                alt='test'
                            />
                            <StyledFigcaption>Edge offline</StyledFigcaption>
                        </StyledFigure>
                    </section>
                </StyledDescription>
            </StyledContainer>
        </FormTemplate>
    );
};
