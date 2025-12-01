import { DeleteProject } from '../DeleteProject.tsx';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { styled } from '@mui/material';

const StyledContainer = styled('div')(({ theme }) => ({
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
}));

interface IDeleteProjectForm {
    featureCount: number;
}
export const DeleteProjectForm = ({ featureCount }: IDeleteProjectForm) => {
    const id = useRequiredPathParam('projectId');
    const { uiConfig } = useUiConfig();
    const { loading } = useProjectApi();
    const formatProjectDeleteApiCode = () => {
        return `curl --location --request DELETE '${uiConfig.unleashUrl}/api/admin/projects/${id}' \\
--header 'Authorization: INSERT_API_KEY' '`;
    };

    return (
        <StyledContainer>
            <FormTemplate
                loading={loading}
                title='Delete project'
                description=''
                documentationLink='https://docs.getunleash.io/concepts/projects'
                documentationLinkLabel='Projects documentation'
                formatApiCode={formatProjectDeleteApiCode}
                compact
                compactPadding
                showDescription={false}
                showLink={false}
            >
                <DeleteProject projectId={id} featureCount={featureCount} />
            </FormTemplate>
        </StyledContainer>
    );
};
