import { useState } from 'react';
import { Button, styled, Typography } from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { useEventTracker } from 'hooks/useEventTracker';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import type { Feature, InProgressFeature, ReleasedFeature } from './features';
import { ShareInputDialog } from './ShareInputDialog';

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
    padding: theme.spacing(2),
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
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const ReleaseDate = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
}));

const InProgressDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const ReleasedDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
}));

const FeatureTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
})) as typeof Typography;

const Actions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
    alignItems: 'center',
}));

const DocsLink = styled('a')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.25),
    color: theme.palette.links,
    ...theme.typography.body2,
    fontWeight: theme.typography.fontWeightMedium,
    textDecoration: 'none',
    '&:hover, &:focus': { textDecoration: 'underline' },
}));

const DocsLinkIcon = styled(OpenInNew)(({ theme }) => ({
    fontSize: theme.spacing(2.25),
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
        ...theme.typography.caption,
        fontWeight: theme.typography.fontWeightBold,
        lineHeight: theme.spacing(2),
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
    const { trackEvent } = useEventTracker();
    return (
        <ReleasedCard hasPreview={Boolean(feature.previewImageSrc)}>
            {feature.previewImageSrc ? (
                <PreviewImage src={feature.previewImageSrc} alt='' />
            ) : null}
            <Content>
                <ReleaseDate variant='body2'>
                    {formatDateYMD(
                        feature.releasedAt,
                        locationSettings.locale,
                        'UTC',
                    )}
                </ReleaseDate>
                <CardHeader>
                    <FeatureTitle component='h2' variant='body1'>
                        {feature.title}
                    </FeatureTitle>
                </CardHeader>
                <ReleasedDescription variant='body2'>
                    {feature.description}
                </ReleasedDescription>
                {feature.docsLink ? (
                    <Actions>
                        <DocsLink
                            href={feature.docsLink}
                            rel='noopener noreferrer'
                            target='_blank'
                            onClick={() => {
                                trackEvent('whats-new-page', {
                                    props: {
                                        eventType: 'feature-docs-click',
                                        feature: feature.title,
                                    },
                                });
                            }}
                        >
                            Read more in docs
                            <DocsLinkIcon />
                        </DocsLink>
                    </Actions>
                ) : null}
            </Content>
        </ReleasedCard>
    );
};

const InProgressFeatureCard = ({ feature }: { feature: InProgressFeature }) => {
    const { trackEvent } = useEventTracker();
    const [dialogOpen, setDialogOpen] = useState(false);

    const openDialog = () => {
        trackEvent('whats-new-page', {
            props: {
                eventType: 'share-input-dialog-open',
                feature: feature.title,
            },
        });
        setDialogOpen(true);
    };

    return (
        <InProgressCard>
            <InProgressBody>
                <CardHeader>
                    <FeatureTitle component='h2' variant='body1'>
                        {feature.title}
                    </FeatureTitle>
                    <PhaseBadge phase={feature.phase}>
                        {phaseLabel(feature.phase)}
                    </PhaseBadge>
                </CardHeader>
                <InProgressDescription variant='body2'>
                    {feature.description}
                </InProgressDescription>
            </InProgressBody>
            <InProgressFooter>
                <Button
                    size='medium'
                    color='secondary'
                    variant='outlined'
                    onClick={openDialog}
                >
                    Share your input
                </Button>
            </InProgressFooter>
            <ShareInputDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                featureTitle={feature.title}
            />
        </InProgressCard>
    );
};

export const FeatureCard = ({ feature }: { feature: Feature }) => {
    if (feature.phase === 'released') {
        return <ReleasedFeatureCard feature={feature} />;
    }
    return <InProgressFeatureCard feature={feature} />;
};
