import { styled, Typography } from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import EmptyStateCorner from 'assets/img/empty-state-corner.svg?react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useEventTracker } from 'hooks/useEventTracker';
import type { Feature, InProgressFeature, ReleasedFeature } from './features';
import { FeatureCard } from './FeatureCard';

const RELEASE_NOTES_URL = 'https://docs.getunleash.io/release-notes';

const PageLayout = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `minmax(0, 1fr) clamp(${theme.spacing(43)}, 28vw, ${theme.spacing(51)})`,
    gap: theme.spacing(2),
    alignItems: 'start',
    [theme.breakpoints.down('lg')]: {
        gridTemplateColumns: `minmax(0, 1fr) clamp(${theme.spacing(43)}, 30vw, ${theme.spacing(47.5)})`,
    },
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
    },
}));

const SectionDescription = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    color: theme.palette.text.secondary,
}));

const ItemList = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const ReleaseNotesLink = styled('a')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: theme.spacing(1.25, 0),
    marginTop: theme.spacing(1.75),
    gap: theme.spacing(1),
    color: theme.palette.links,
    fontWeight: theme.typography.fontWeightBold,
    textDecoration: 'none',
    '&:hover, &:focus': { textDecoration: 'underline' },
}));

const InProgressEmptyState = styled(Typography)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.elevation1,
    padding: theme.spacing(2, 2, 9, 2),
    color: theme.palette.text.primary,
}));

const EmptyStateCornerDecoration = styled(EmptyStateCorner)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(2),
    bottom: theme.spacing(1.5),
    width: 63,
    height: 63,
    pointerEvents: 'none',
}));

type WhatsNewLayoutProps = {
    features: Feature[];
};

export const WhatsNewLayout = ({ features }: WhatsNewLayoutProps) => {
    const { trackEvent } = useEventTracker();

    const released: ReleasedFeature[] = features
        .filter((f): f is ReleasedFeature => f.phase === 'released')
        .toSorted((a, b) => b.releasedAt.localeCompare(a.releasedAt));

    const inProgress: InProgressFeature[] = features.filter(
        (f): f is InProgressFeature => f.phase !== 'released',
    );

    return (
        <PageLayout>
            <PageContent header={<PageHeader title="What's new" />}>
                <SectionDescription variant='body2'>
                    These are the latest capabilities we've added to Unleash —
                    explore what's new and start using them today.
                </SectionDescription>
                {released.length > 0 && (
                    <ItemList>
                        {released.map((feature) => (
                            <FeatureCard
                                key={feature.title}
                                feature={feature}
                            />
                        ))}
                    </ItemList>
                )}
                <ReleaseNotesLink
                    href={RELEASE_NOTES_URL}
                    rel='noopener noreferrer'
                    target='_blank'
                    onClick={() => {
                        trackEvent('whats-new-page', {
                            props: { eventType: 'release-notes-click' },
                        });
                    }}
                >
                    View all release notes
                    <OpenInNew fontSize='small' />
                </ReleaseNotesLink>
            </PageContent>
            <PageContent header={<PageHeader title="What we're working on" />}>
                {inProgress.length === 0 ? (
                    <InProgressEmptyState variant='body2'>
                        Early access features will show up here when they're
                        ready for testing. When we're running discovery on a
                        topic, you may also see prompts to share your input.
                        <EmptyStateCornerDecoration aria-hidden='true' />
                    </InProgressEmptyState>
                ) : (
                    <>
                        <SectionDescription variant='body2'>
                            Try features that are still in development and help
                            us decide what to build next.
                        </SectionDescription>
                        <ItemList>
                            {inProgress.map((feature) => (
                                <FeatureCard
                                    key={feature.title}
                                    feature={feature}
                                />
                            ))}
                        </ItemList>
                    </>
                )}
            </PageContent>
        </PageLayout>
    );
};
