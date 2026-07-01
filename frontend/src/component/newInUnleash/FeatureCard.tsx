import { Button, styled, Typography } from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import type { Feature, InProgressFeature, ReleasedFeature } from './features';

const buildInputMailto = (title: string) => {
    const subject = encodeURIComponent(`Input on ${title}`);
    const body = encodeURIComponent(
        `Hi Unleash team,\n\nI'd like to share some input on ${title}:\n\n`,
    );
    return `mailto:beta@getunleash.io?subject=${subject}&body=${body}`;
};

const IMAGE_HEIGHT = 190;
const IMAGE_WIDTH = 160;

const ReleasedCard = styled('article', {
    shouldForwardProp: (prop) => prop !== 'hasPreview',
})<{ hasPreview: boolean }>(({ theme, hasPreview }) => ({
    display: 'grid',
    gridTemplateColumns: hasPreview ? `${IMAGE_WIDTH}px minmax(0, 1fr)` : '1fr',
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
    },
}));

const Content = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
}));

const InProgressCard = styled('article')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
}));

const InProgressBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(2.5),
}));

const InProgressFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(1.5, 1),
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.elevation1,
}));

const CardHeader = styled('header')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const ReleaseDate = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    marginBottom: theme.spacing(1),
}));

const Actions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    alignItems: 'center',
}));

const DocsLink = styled('a')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.links,
    fontWeight: theme.typography.fontWeightBold,
    textDecoration: 'none',
    '&:hover, &:focus': { textDecoration: 'underline' },
}));

const PreviewImage = styled('img')(({ theme }) => ({
    width: '100%',
    height: '100%',
    minHeight: IMAGE_HEIGHT,
    objectFit: 'cover',
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
}));

const phaseLabel = (phase: InProgressFeature['phase']) =>
    phase === 'beta' ? 'Beta' : 'Exploring';

const PhaseBadge = styled('span', {
    shouldForwardProp: (prop) => prop !== 'phase',
})<{ phase: InProgressFeature['phase'] }>(({ theme, phase }) => {
    const isBeta = phase === 'beta';
    return {
        marginLeft: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        padding: theme.spacing(0.5, 1.5),
        borderRadius: theme.spacing(2),
        backgroundColor: isBeta
            ? theme.palette.secondary.light
            : theme.palette.success.light,
        color: isBeta ? theme.palette.primary.main : theme.palette.success.main,
        '&::before': {
            content: '""',
            width: theme.spacing(1),
            height: theme.spacing(1),
            borderRadius: '50%',
            backgroundColor: 'currentColor',
        },
    };
});

const ReleasedFeatureCard = ({ feature }: { feature: ReleasedFeature }) => {
    const { locationSettings } = useLocationSettings();
    return (
        <ReleasedCard hasPreview={Boolean(feature.previewImageSrc)}>
            {feature.previewImageSrc ? (
                <PreviewImage src={feature.previewImageSrc} alt='' />
            ) : null}
            <Content>
                <ReleaseDate>
                    {formatDateYMD(
                        feature.releasedAt,
                        locationSettings.locale,
                        'UTC',
                    )}
                </ReleaseDate>
                <CardHeader>
                    <Typography component='h2' variant='h3'>
                        {feature.title}
                    </Typography>
                </CardHeader>
                <Typography variant='body1' color='text.secondary'>
                    {feature.description}
                </Typography>
                {feature.docsLink ? (
                    <Actions>
                        <DocsLink
                            href={feature.docsLink}
                            rel='noopener noreferrer'
                            target='_blank'
                        >
                            <OpenInNew fontSize='small' />
                            Read more in our documentation
                        </DocsLink>
                    </Actions>
                ) : null}
            </Content>
        </ReleasedCard>
    );
};

const InProgressFeatureCard = ({ feature }: { feature: InProgressFeature }) => (
    <InProgressCard>
        <InProgressBody>
            <CardHeader>
                <Typography component='h2' variant='h4'>
                    {feature.title}
                </Typography>
                <PhaseBadge phase={feature.phase}>
                    {phaseLabel(feature.phase)}
                </PhaseBadge>
            </CardHeader>
            <Typography variant='body2' color='text.secondary'>
                {feature.description}
            </Typography>
        </InProgressBody>
        <InProgressFooter>
            <Button
                color='secondary'
                variant='outlined'
                href={buildInputMailto(feature.title)}
            >
                Share your input
            </Button>
        </InProgressFooter>
    </InProgressCard>
);

export const FeatureCard = ({ feature }: { feature: Feature }) => {
    if (feature.phase === 'released') {
        return <ReleasedFeatureCard feature={feature} />;
    }
    return <InProgressFeatureCard feature={feature} />;
};
