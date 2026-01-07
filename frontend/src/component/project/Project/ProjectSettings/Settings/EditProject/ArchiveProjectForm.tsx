import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { styled } from '@mui/material';
import { ArchiveProject } from '../ArchiveProject.tsx';

const StyledContainer = styled('div')(({ theme }) => ({
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
}));

interface IDeleteProjectForm {
    featureCount: number;
}
export const ArchiveProjectForm = ({ featureCount }: IDeleteProjectForm) => {
    const id = useRequiredPathParam('projectId');
    const { uiConfig } = useUiConfig();
    const { loading } = useProjectApi();
    const formatProjectArchiveApiCode = () => {
        return `curl --location --request POST '${uiConfig.unleashUrl}/api/admin/projects/archive/${id}' \\
--header 'Authorization: INSERT_API_KEY'`;
    };

    return (
        <StyledContainer>
            <FormTemplate
                loading={loading}
                title='Archive project'
                description=''
                documentationLink='https://docs.getunleash.io/concepts/projects'
                documentationLinkLabel='Projects documentation'
                formatApiCode={formatProjectArchiveApiCode}
                compact
                compactPadding
                showDescription={false}
                showLink={false}
            >
                <ArchiveProject projectId={id} featureCount={featureCount} />
            </FormTemplate>
        </StyledContainer>
    );
};
