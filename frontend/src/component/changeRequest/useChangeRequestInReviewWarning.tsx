import { Alert } from '@mui/material';
import { oneOf } from 'utils/oneOf';
import { IChangeRequest } from './changeRequest.types';

export const useChangeRequestInReviewWarning = (
    draft: IChangeRequest[] | undefined
) => {
    const changeRequestInReviewOrApproved = (environment: string) => {
        if (!draft) return false;

        return draft.some(
            changeRequest =>
                changeRequest.environment === environment &&
                oneOf(['In review', 'Approved'], changeRequest.state)
        );
    };

    return {
        changeRequestInReviewOrApproved,
        alert: (
            <Alert sx={{ margin: '1rem 0' }} severity="warning">
                You currently have a change request in review for this
                environment. Adding a new change will add to this change request
                will automatically update it, and all existing approvals will be
                reset. Are you sure you want to continue?
            </Alert>
        ),
    };
};
