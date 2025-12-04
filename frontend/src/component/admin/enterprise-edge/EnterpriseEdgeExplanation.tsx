import { Button, styled, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ReactComponent as EnterpriseEdgeCloud } from 'assets/img/enterpriseEdgeCloud.svg';
import { ReactComponent as EnterpriseEdgeSelfHosted } from 'assets/img/enterpriseEdgeSelfHosted.svg';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    maxWidth: theme.spacing(80),
    margin: 'auto',
}));

const StyledCardsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2.5),
    marginTop: theme.spacing(2.5),
}));

const StyledCard = styled('div')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

const StyledImageContainer = styled('div')({
    '& > svg': {
        width: 'auto',
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
    },
});

const StyledBulletList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(0),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledBulletItem = styled('li')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledCheck = styled(CheckIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: '18px',
}));

const StyledLinkContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
    margin: theme.spacing(-0.75),
}));

export const EnterpriseEdgeExplanation = () => (
    <StyledContainer>
        <Typography variant='h3'>Which version is right for you?</Typography>
        <Typography variant='body2' color='text.secondary'>
            Unleash Enterprise Edge is a high-performance proxy engineered for
            scalability, resilience, and privacy. It acts as a shield between
            your SDKs and the Unleash API, allowing you to handle thousands of
            concurrent connections with zero impact on your primary instance.
            Contact{' '}
            <a href='mailto:license@getunleash.io'>license@getunleash.io</a>{' '}
            today to provision your private Enterprise Edge environment.
        </Typography>
        <StyledCardsContainer>
            <EdgeVersionCard
                image={<EnterpriseEdgeCloud />}
                title='Cloud hosted'
                description='When you need to connect to Unleash from geographically distributed locations.'
                bullets={[
                    'Global infrastructure',
                    'No operational burden',
                    'Instant flag updates worldwide',
                ]}
                docsUrl='https://docs.getunleash.io/unleash-edge'
            />
            <EdgeVersionCard
                image={<EnterpriseEdgeSelfHosted />}
                title='Self hosted'
                description='Ensure low latency and data sovereignty by running Enterprise Edge inside your private network.'
                bullets={[
                    'Ideal for PII heavy data',
                    'Optimized for minimal latency',
                    'Improved security',
                ]}
                docsUrl='https://docs.getunleash.io/unleash-edge'
            />
        </StyledCardsContainer>
    </StyledContainer>
);

interface IEdgeVersionCardProps {
    image: ReactNode;
    title: string;
    description: string;
    bullets: string[];
    docsUrl: string;
}

const EdgeVersionCard = ({
    image,
    title,
    description,
    bullets,
    docsUrl,
}: IEdgeVersionCardProps) => (
    <StyledCard>
        <StyledImageContainer>{image}</StyledImageContainer>
        <Typography variant='h3'>{title}</Typography>
        <Typography variant='body2' color='text.secondary'>
            {description}
        </Typography>
        <StyledBulletList>
            {bullets.map((bullet) => (
                <StyledBulletItem key={bullet}>
                    <StyledCheck />{' '}
                    <Typography variant='body2' color='text.secondary'>
                        {bullet}
                    </Typography>
                </StyledBulletItem>
            ))}
        </StyledBulletList>
        <Typography variant='body2' color='text.secondary'>
            Contact{' '}
            <a href='mailto:license@getunleash.io'>license@getunleash.io</a> to
            get started.
        </Typography>
        <StyledLinkContainer>
            <Button
                component={Link}
                to={docsUrl}
                size='small'
                sx={{ fontSize: '14px' }}
                rel='noopener noreferrer'
                target='_blank'
            >
                Read docs
            </Button>
        </StyledLinkContainer>
    </StyledCard>
);
