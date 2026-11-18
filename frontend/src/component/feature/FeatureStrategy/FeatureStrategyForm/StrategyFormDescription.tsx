import { Link as RouterLink } from 'react-router';
import { Link, type LinkProps, styled, Typography } from '@mui/material';
import DocsIcon from '@mui/icons-material/MenuBook';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { strategyDocsLinkTracking } from '../strategyActionsTracking';
import { useTracking } from 'hooks/useTracking';

const strategyDocsLink =
    'https://docs.getunleash.io/concepts/activation-strategies';

const defaultStrategyDocsLink =
    'https://docs.getunleash.io/concepts/projects#project-default-strategy';

const SidebarLink = styled((props: LinkProps) => {
    return (
        <Link
            to={props.href}
            rel='noopener noreferrer'
            target='_blank'
            component={RouterLink}
            {...props}
        />
    );
})(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    textDecoration: 'none',
    ':hover, :focus-visible': {
        textDecoration: 'underline',
    },
})) as typeof Link;

const DocsLink = styled((props: LinkProps) => {
    const trackDocsLinkClick = useTracking(strategyDocsLinkTracking);

    return (
        <SidebarLink
            {...props}
            onClick={() => trackDocsLinkClick('succeeded')}
        />
    );
})({
    textDecoration: 'underline',
});

const Row = styled(Typography)(({ theme }) => ({
    display: 'flex',
    alignItems: 'start',
    flexFlow: 'row nowrap',
    gap: theme.spacing(1.5),
    svg: {
        fontSize: 'inherit',
        inlineSize: theme.spacing(2),
        blockSize: '1lh',
    },
})) as typeof Typography;

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column nowrap',
    gap: theme.spacing(1),
}));

const ActionLinkList = styled('ul')({ display: 'contents' });

const InAppLinks = () => {
    const projectId = useOptionalPathParam('projectId');
    const hrefTo = (target: string) =>
        projectId ? `/projects/${projectId}/settings/${target}` : `/${target}`;

    return (
        <ActionLinkList role='list'>
            <Row component='li'>
                <ArrowOutwardIcon />
                <SidebarLink href={hrefTo('segments')}>
                    Manage segments
                </SidebarLink>
            </Row>
            <Row component='li'>
                <ArrowOutwardIcon />
                <SidebarLink href={hrefTo('context')}>
                    Manage context fields
                </SidebarLink>
            </Row>
        </ActionLinkList>
    );
};

export type StrategyFormContext = 'projectDefaultStrategy';

type StrategyFormDescriptionProps = {
    formContext?: StrategyFormContext;
};

const StrategyLink = () => (
    <span>
        Read more about strategies in our{' '}
        <DocsLink href={strategyDocsLink}>documentation</DocsLink>
    </span>
);

const ProjectDefaultStrategyLink = () => (
    <span>
        Read more about default strategies in our{' '}
        <DocsLink href={defaultStrategyDocsLink}>documentation</DocsLink>
    </span>
);

export const StrategyFormDescription = ({
    formContext,
}: StrategyFormDescriptionProps) => {
    return (
        <Container>
            <Row>
                <DocsIcon />
                {formContext === 'projectDefaultStrategy' ? (
                    <ProjectDefaultStrategyLink />
                ) : (
                    <StrategyLink />
                )}
            </Row>
            <InAppLinks />
        </Container>
    );
};
