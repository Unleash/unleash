import { styled, Typography } from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import NotFound from 'component/common/NotFound/NotFound';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useUiFlag } from 'hooks/useUiFlag';
import {
    features,
    type InProgressFeature,
    type ReleasedFeature,
} from './features';
import { FeatureCard } from './FeatureCard';

const RELEASE_NOTES_URL = 'https://docs.getunleash.io/release-notes';

const PageLayout = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 343px)',
    gap: theme.spacing(2),
    alignItems: 'start',
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

const EmptyState = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const ReleasedSection = styled(PageContent)(({ theme }) => ({
    '& > .body': {
        padding: theme.spacing(3),
    },
}));

const InProgressSection = styled(PageContent)(({ theme }) => ({
    '& > .body': {
        padding: theme.spacing(2),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(3),
        },
    },
}));

export const NewInUnleashPage = () => {
    const enabled = useUiFlag('newInUnleashPage');

    if (!enabled) {
        return <NotFound />;
    }

    const released: ReleasedFeature[] = features
        .filter((f): f is ReleasedFeature => f.phase === 'released')
        .toSorted((a, b) => b.releasedAt.localeCompare(a.releasedAt));

    const inProgress: InProgressFeature[] = features.filter(
        (f): f is InProgressFeature => f.phase !== 'released',
    );

    return (
        <PageLayout>
            <ReleasedSection
                bodyClass='no-padding'
                header={<PageHeader title='New in Unleash' />}
            >
                <SectionDescription variant='body2'>
                    These are the latest capabilities we've added to Unleash —
                    explore what's new and start using them today.
                </SectionDescription>
                {released.length === 0 ? (
                    <EmptyState>Nothing new to show right now.</EmptyState>
                ) : (
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
                >
                    View all release notes
                    <OpenInNew fontSize='small' />
                </ReleaseNotesLink>
            </ReleasedSection>
            <InProgressSection
                bodyClass='no-padding'
                header={<PageHeader title="What we're working on" />}
            >
                <SectionDescription variant='body2'>
                    Try features that are still in development and help us
                    decide what to build next.
                </SectionDescription>
                {inProgress.length === 0 ? (
                    <EmptyState>Nothing to share yet.</EmptyState>
                ) : (
                    <ItemList>
                        {inProgress.map((feature) => (
                            <FeatureCard
                                key={feature.title}
                                feature={feature}
                            />
                        ))}
                    </ItemList>
                )}
            </InProgressSection>
        </PageLayout>
    );
};
