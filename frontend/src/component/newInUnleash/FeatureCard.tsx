import { styled, Typography } from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import type {
    Feature,
    InProgressFeature,
    ReleasedFeature,
} from './features';

const ReleasedCard = styled('article', {
    shouldForwardProp: (prop) => prop !== 'hasPreview',
})<{ hasPreview: boolean }>(({ theme, hasPreview }) => ({
    display: 'grid',
    gridTemplateColumns: hasPreview
        ? 'minmax(0, 1fr) minmax(0, 280px)'
        : '1fr',
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
    },
}));

const InProgressCard = styled('article')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
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

const Preview = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
}));

const formatReleaseDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

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
        color: isBeta
            ? theme.palette.primary.main
            : theme.palette.success.main,
        '&::before': {
            content: '""',
            width: theme.spacing(1),
            height: theme.spacing(1),
            borderRadius: '50%',
            backgroundColor: 'currentColor',
        },
    };
});

const ReleasedFeatureCard = ({ feature }: { feature: ReleasedFeature }) => (
    <ReleasedCard hasPreview={Boolean(feature.preview)}>
        <div>
            <CardHeader>
                <Typography component='h2' variant='h3'>
                    {feature.title}
                </Typography>
            </CardHeader>
            <ReleaseDate>
                Released {formatReleaseDate(feature.releasedAt)}
            </ReleaseDate>
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
        </div>
        {feature.preview ? <Preview>{feature.preview}</Preview> : null}
    </ReleasedCard>
);

const InProgressFeatureCard = ({
    feature,
}: {
    feature: InProgressFeature;
}) => (
    <InProgressCard>
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
        {feature.docsLink ? (
            <Actions>
                <DocsLink
                    href={feature.docsLink}
                    rel='noopener noreferrer'
                    target='_blank'
                >
                    <OpenInNew fontSize='small' />
                    Docs
                </DocsLink>
            </Actions>
        ) : null}
    </InProgressCard>
);

export const FeatureCard = ({ feature }: { feature: Feature }) => {
    if (feature.phase === 'released') {
        return <ReleasedFeatureCard feature={feature} />;
    }
    return <InProgressFeatureCard feature={feature} />;
};
