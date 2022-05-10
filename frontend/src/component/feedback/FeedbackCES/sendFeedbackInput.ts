import { IFeedbackCESForm } from 'component/feedback/FeedbackCES/FeedbackCESForm';

interface IFeedbackEndpointRequestBody {
    source: 'app' | 'app:segments';
    data: {
        score: number;
        comment?: string;
        customerType?: 'open source' | 'paying';
        openedManually?: boolean;
        currentPage?: string;
    };
}

export const sendFeedbackInput = async (
    form: Partial<IFeedbackCESForm>
): Promise<void> => {
    if (!form.score) {
        return;
    }

    const body: IFeedbackEndpointRequestBody = {
        source: 'app:segments',
        data: {
            score: form.score,
            comment: form.comment,
            currentPage: form.path,
            openedManually: false,
            customerType: 'paying',
        },
    };

    await fetch(
        'https://europe-west3-metrics-304612.cloudfunctions.net/docs-app-feedback',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }
    );
};
