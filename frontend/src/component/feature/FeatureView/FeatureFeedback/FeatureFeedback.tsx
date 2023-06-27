import { PageContent } from 'component/common/PageContent/PageContent';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

export const FeatureFeedback = () => {
    const featureId = useRequiredPathParam('featureId');
    usePageTitle('Feature Feedback');

    return <PageContent></PageContent>;
};
