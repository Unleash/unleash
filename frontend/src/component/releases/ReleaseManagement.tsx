import { PageContent } from 'component/common/PageContent/PageContent';
import { styled } from '@mui/material';
import { styles as themeStyles } from 'component/common';
import { usePageTitle } from 'hooks/usePageTitle';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import Add from '@mui/icons-material/Add';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CREATE_RELEASE_TEMPLATE } from 'component/providers/AccessProvider/permissions';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as NoReleaseTemplates } from 'assets/img/releaseTemplates.svg';

const NoTemplatesMessage = styled('div')(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(1, 0, 0, 0),
}));

const TemplatesEasierMessage = styled('div')(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(1, 0, 9, 0),
    color: theme.palette.text.secondary,
}));

const StyledCenter = styled('div')(({ theme }) => ({
    margin: theme.spacing(5, 0, 0, 0),
    textAlign: 'center',
}));

const RenderNoTemplates = () => {
    return (
        <>
            <StyledCenter>
                <NoReleaseTemplates />
            </StyledCenter>
            <NoTemplatesMessage>
                You have no release templates set up
            </NoTemplatesMessage>
            <TemplatesEasierMessage>
                Make the set up of strategies easier for your
                <br />
                teams by creating templates
            </TemplatesEasierMessage>
        </>
    );
};

export const ReleaseManagement = () => {
    usePageTitle('Release management');
    const navigate = useNavigate();

    return (
        <>
            <PageContent
                bodyClass='no-padding'
                header={
                    <PageHeader
                        title={`Release templates`}
                        actions={
                            <ResponsiveButton
                                Icon={Add}
                                onClick={() => {
                                    navigate(
                                        '/release-management/create-template',
                                    );
                                }}
                                maxWidth='700px'
                                permission={CREATE_RELEASE_TEMPLATE}
                                disabled={false}
                            >
                                New template
                            </ResponsiveButton>
                        }
                    />
                }
            >
                <div className={themeStyles.fullwidth}>
                    <RenderNoTemplates />
                </div>
            </PageContent>
        </>
    );
};
