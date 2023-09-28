import React from 'react';
import { DeleteProject } from '../DeleteProject';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PageContent } from '../../../../../common/PageContent/PageContent';
import { PageHeader } from '../../../../../common/PageHeader/PageHeader';

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
        <FormTemplate
            loading={loading}
            title="Delete Project"
            description=""
            documentationLink="https://docs.getunleash.io/reference/projects"
            documentationLinkLabel="Projects documentation"
            formatApiCode={formatProjectDeleteApiCode}
            compact
            compactPadding
            showDescription={false}
            showLink={false}
        >
            <DeleteProject projectId={id} featureCount={featureCount} />
        </FormTemplate>
    );
};
