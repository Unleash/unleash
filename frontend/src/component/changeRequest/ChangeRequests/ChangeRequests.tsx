import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';

export const ChangeRequests = () => {
    return (
        <PageContent
            header={
                <PageHeader title="Change Requests" />
            }
        >
            <p>Change requests table will go here</p>
        </PageContent>
    );
};