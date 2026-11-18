import { Link as RouterLink } from 'react-router';
import { Link, type LinkProps, styled, Typography } from '@mui/material';
import DocsIcon from '@mui/icons-material/MenuBook';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

const strategyDocsLink =
    'https://docs.getunleash.io/concepts/activation-strategies';

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

// const docsTracking: Tracking = { //todo: move it to strategyActionsTracking?
//     event: 'strategy-form', // todo: we probably wanna know what version of the form this is (create, edit, template, default, etc)
//     type: 'open-strategy-docs',
// };
const DocsLink = styled((props: LinkProps) => {
    // const tracking = useTracking(docsTracking);

    return (
        <SidebarLink
            // todo: finish tracking
            // onClick={() =>
            //     trackEvent('docs-opened', {
            //         props: {
            //             href: props.href,
            //             action: 'clicked',
            //         },
            //     })
            // }
            {...props}
        />
    );
})({
    textDecoration: 'underline',
});

const DocsLinkList = styled('ul')({
    listStyle: 'none',
    padding: 0,
    margin: 0,
});

const Row = styled(Typography)(({ theme }) => ({
    display: 'flex',
    alignItems: 'start',
    flexFlow: 'row nowrap',
    gap: theme.spacing(1.5),
    svg: {
        fontSize: theme.spacing(2),
        blockSize: '1lh',
    },
})) as typeof Typography;

const Container = styled('div')(({ theme }) => ({}));

export const StrategyFormDescription = () => {
    // todo: build actual links to segments and constraints
    return (
        <Container>
            <Row>
                <DocsIcon />
                <span>
                    Read more about strategies in our{' '}
                    <DocsLink href={strategyDocsLink}>documentation</DocsLink>
                </span>
            </Row>
            <DocsLinkList role='list'>
                <Row component='li'>
                    <ArrowOutwardIcon />
                    <SidebarLink href={'/segments'}>
                        Manage segments
                    </SidebarLink>
                </Row>
                <Row component='li'>
                    <ArrowOutwardIcon />
                    <SidebarLink href={'/constraints'}>
                        Manage constraints
                    </SidebarLink>
                </Row>
            </DocsLinkList>
        </Container>
    );
};
