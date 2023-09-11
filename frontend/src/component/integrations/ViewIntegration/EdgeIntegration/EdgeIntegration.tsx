import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { styled } from '@mui/material';

import { IntegrationIcon } from '../../IntegrationList/IntegrationIcon/IntegrationIcon';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import LaunchIcon from '@mui/icons-material/Launch';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledGrayContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledIconLine = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

const StyledLink = styled('a')({
    textDecoration: 'none',
});

export const EDGE_INFO = {
    name: 'unleash',
    displayName: 'Unleash Edge',
    description: 'Unleash Edge is the successor to the Unleash Proxy.',
    documentationUrl: 'https://docs.getunleash.io/reference/unleash-edge',
    howTo: `Unleash Edge sits between the Unleash API and your SDKs and provides a cached read-replica of your Unleash instance. This means you can scale up your Unleash instance to thousands of connected SDKs without increasing the number of requests you make to your Unleash instance.
Unleash Edge offers two important features:
  - **Performance:** Unleash Edge caches in memory and can run close to your end-users. A single instance can handle tens to hundreds of thousands of requests per second.
  - **Resilience:** Unleash Edge is designed to survive restarts and operate properly even if you lose connection to your Unleash server.`,
};

export const EdgeIntegration = () => {
    const { name, displayName, description, documentationUrl, howTo } =
        EDGE_INFO;

    return (
        <FormTemplate
            title={`${displayName}`}
            description={description || ''}
            documentationLink={documentationUrl}
            documentationLinkLabel="Unleash Edge documentation"
        >
            <StyledContainer>
                <StyledGrayContainer>
                    <StyledIconLine>
                        <IntegrationIcon name={name} /> How does it work?
                    </StyledIconLine>
                    <ReactMarkdown>{howTo}</ReactMarkdown>
                </StyledGrayContainer>
                <StyledGrayContainer>
                    <StyledLink
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://github.com/Unleash/unleash-edge#readme"
                    >
                        View Unleash Edge on GitHub{' '}
                        <LaunchIcon
                            fontSize="inherit"
                            sx={{
                                verticalAlign: 'middle',
                                marginBottom: '2px',
                            }}
                        />
                    </StyledLink>
                </StyledGrayContainer>
                <iframe
                    src="https://www.youtube-nocookie.com/embed/6uIdF-yByWs?si=rPzsFCM_2IheaTUo"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                        width: '100%',
                        aspectRatio: '16/9',
                    }}
                ></iframe>
            </StyledContainer>
        </FormTemplate>
    );
};
