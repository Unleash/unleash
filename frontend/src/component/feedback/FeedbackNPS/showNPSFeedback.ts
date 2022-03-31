import differenceInDays from 'date-fns/differenceInDays';
import { IAuthFeedback } from 'hooks/api/getters/useAuth/useAuthEndpoint';

export const PNPS_FEEDBACK_ID = 'pnps';

export const showNPSFeedback = (
    feedbackList: IAuthFeedback[] | undefined
): boolean => {
    if (!feedbackList) {
        return false;
    }

    if (feedbackList.length === 0) {
        return true;
    }

    const feedback = feedbackList.find(
        feedback => feedback.feedbackId === PNPS_FEEDBACK_ID
    );

    if (!feedback) {
        return true;
    }

    if (feedback.neverShow) {
        return false;
    }

    if (feedback.given) {
        const SIX_MONTHS_IN_DAYS = 182;
        const now = new Date();
        const difference = differenceInDays(now, new Date(feedback.given));
        return difference > SIX_MONTHS_IN_DAYS;
    }

    return false;
};
