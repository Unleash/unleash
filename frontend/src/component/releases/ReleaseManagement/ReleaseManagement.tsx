import { PageContent } from 'component/common/PageContent/PageContent';
import {
    Alert,
    Button,
    type ButtonProps,
    Collapse,
    Grid,
    styled,
    Typography,
} from '@mui/material';
import { styles as themeStyles } from 'component/common';
import { usePageTitle } from 'hooks/usePageTitle';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import Add from '@mui/icons-material/Add';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';
import { EmptyTemplatesListMessage } from './EmptyTemplatesListMessage.tsx';
import { ReleasePlanTemplateList } from './ReleasePlanTemplateList.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { RELEASE_PLAN_TEMPLATE_CREATE } from '@server/types/permissions';
import MenuBook from '@mui/icons-material/MenuBook';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';

const StyledLink = styled(Link)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: 0,
    color: theme.palette.links,
    fontWeight: theme.fontWeight.medium,
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
    width: 'max-content',
}));

const StyledMenuBook = styled(MenuBook)(({ theme }) => ({
    fontSize: theme.spacing(2.25),
}));

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column nowrap',
    gap: theme.spacing(2),
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    '& > .MuiAlert-icon': {
        paddingBlock: '7px',
    },
    '& > .MuiAlert-message': {
        padding: theme.spacing(1),
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        width: '100%',
        gap: theme.spacing(1),
    },
}));

const StyledAlertButton = styled(Button)<ButtonProps<typeof Link>>(
    ({ theme }) => ({ '&&': { color: theme.palette.primary.main } }),
);

export const ReleaseManagement = () => {
    usePageTitle('Release templates');
    const navigate = useNavigate();
    const data = useReleasePlanTemplates();

    const [infoAlertState, setInfoAlertState] = useLocalStorageState<
        'open' | 'closed'
    >('releaseManagementInfoAlert', 'open');

    const { isEnterprise } = useUiConfig();
    if (!isEnterprise()) {
        return <PremiumFeature feature='releaseManagement' page />;
    }

    return (
        <Container>
            <Collapse in={infoAlertState === 'open'}>
                <StyledAlert
                    severity='info'
                    onClose={() => setInfoAlertState('closed')}
                >
                    <Typography component='p' display='inline'>
                        <Typography
                            fontWeight={'bold'}
                            display='block'
                            component='span'
                        >
                            Standardize your rollouts with Release templates.
                        </Typography>
                        <Typography component='span'>
                            Define your release process once, then reuse it
                            across all feature flags with sequential milestones.
                        </Typography>
                    </Typography>
                    <StyledAlertButton
                        component={Link}
                        variant='outlined'
                        target='_blank'
                        rel='noopener noreferrer'
                        to='https://docs.getunleash.io/reference/release-templates'
                    >
                        Learn about release templates
                    </StyledAlertButton>
                </StyledAlert>
            </Collapse>
            <PageContent
                header={
                    <PageHeader
                        title={`Release templates`}
                        actions={
                            <ResponsiveButton
                                Icon={Add}
                                onClick={() => {
                                    navigate(
                                        '/release-templates/create-template',
                                    );
                                }}
                                maxWidth='700px'
                                permission={RELEASE_PLAN_TEMPLATE_CREATE}
                                disabled={!isEnterprise()}
                            >
                                New template
                            </ResponsiveButton>
                        }
                    />
                }
            >
                {data.templates.length > 0 && (
                    <Grid container spacing={2}>
                        <ReleasePlanTemplateList templates={data.templates} />
                    </Grid>
                )}
                {data.templates.length === 0 && (
                    <div className={themeStyles.fullwidth}>
                        <EmptyTemplatesListMessage />
                    </div>
                )}
            </PageContent>

            <StyledLink
                to='https://docs.getunleash.io/concepts/release-templates'
                rel='noopener noreferrer'
                target='_blank'
            >
                <StyledMenuBook /> Read more in our documentation
            </StyledLink>
        </Container>
    );
};
