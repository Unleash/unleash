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
        'https://europe-west3-docs-feedback-v1.cloudfunctions.net/function-1',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }
    );
};
