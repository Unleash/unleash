import useAPI from 'hooks/api/actions/useApi/useApi';

export type SignupData = {
    password: string;
    name: string;
    companyRole: string;
    companyName: string;
    companyIsNA: boolean;
    productUpdatesEmailConsent: boolean;
    inviteEmails: string[];
};

const ENDPOINT = 'api/admin/signup';

export const useSignupApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const submitSignupData = async (subscriptionData: SignupData) => {
        const req = createRequest(ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(subscriptionData),
        });

        await makeRequest(req.caller, req.id);
    };

    return {
        submitSignupData,
        errors,
        loading,
    };
};
