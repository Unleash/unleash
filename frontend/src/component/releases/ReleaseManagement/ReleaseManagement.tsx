import { PageContent } from 'component/common/PageContent/PageContent';
import { Box, Grid, styled } from '@mui/material';
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
import HowToApplyReleaseTemplatesImage from 'assets/img/howToApplyReleaseTemplates.png';
import HowToApplyReleaseTemplatesDarkImage from 'assets/img/howToApplyReleaseTemplatesDark.png';
import MenuBook from '@mui/icons-material/MenuBook';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { formatAssetPath } from 'utils/formatPath';

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

const StyledImg = styled('img')(() => ({
    maxWidth: '100%',
}));

const CenteredHowTo = styled(Box)(({ theme }) => ({
    margin: theme.spacing(3, 0),
    display: 'flex',
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.elevation1,
    boxShadow: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    '> svg': { display: 'block', width: '100%', height: 'auto' },
}));

export const ReleaseManagement = () => {
    usePageTitle('Release templates');
    const navigate = useNavigate();
    const data = useReleasePlanTemplates();

    const { isEnterprise } = useUiConfig();
    if (!isEnterprise()) {
        return <PremiumFeature feature='releaseManagement' page />;
    }

    return (
        <>
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

            <CenteredHowTo>
                <ThemeMode
                    darkmode={
                        <StyledImg
                            src={formatAssetPath(
                                HowToApplyReleaseTemplatesDarkImage,
                            )}
                            alt='How to setup release templates'
                        />
                    }
                    lightmode={
                        <StyledImg
                            src={formatAssetPath(
                                HowToApplyReleaseTemplatesImage,
                            )}
                            alt='How to setup release templates'
                        />
                    }
                />
            </CenteredHowTo>
            <StyledLink
                to='https://docs.getunleash.io/concepts/release-templates'
                rel='noopener noreferrer'
                target='_blank'
            >
                <StyledMenuBook /> Read more in our documentation
            </StyledLink>
        </>
    );
};
