import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import NotFound from 'component/common/NotFound/NotFound';
import { FeatureTypeSchema } from 'openapi';
import { VFC } from 'react';
import { useParams } from 'react-router-dom';

type FeatureTypeFormProps = {
    featureTypes: FeatureTypeSchema[];
};

export const FeatureTypeForm: VFC<FeatureTypeFormProps> = ({
    featureTypes,
}) => {
    const { featureTypeId } = useParams();
    const featureType = featureTypes.find(
        featureType => featureType.id === featureTypeId
    );

    if (!featureType) {
        return <NotFound />;
    }

    return (
        <FormTemplate
            modal
            title={`Edit toggle type: ${featureType?.name}`}
            description={'test'}
            documentationLink={'featureStrategyDocsLink'}
            documentationLinkLabel={'featureStrategyDocsLinkLabel'}
            formatApiCode={
                () => ''
                // formatAddStrategyApiCode(
                //     projectId,
                //     featureId,
                //     environmentId,
                //     payload,
                //     unleashUrl
                // )
            }
        >
            test
        </FormTemplate>
    );
};
