import type { ChangeRequestSearchResponseSchema } from 'openapi';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import useUiConfig from '../useUiConfig/useUiConfig.js';
import { useAuthUser } from '../useAuth/useAuthUser.js';

const fetcher = (path: string): Promise<ChangeRequestSearchResponseSchema> =>
    fetch(path)
        .then(handleErrorResponses('Approval requested count'))
        .then((res) => res.json());

// Counts what the Approval Requested filter on the change requests page lists. Only the total is needed, so a single change request is requested to keep the response small.
export const useApprovalRequestedCount = (): {
    total?: number;
    refetch: () => void;
} => {
    const { isEnterprise } = useUiConfig();
    const { user } = useAuthUser();
    const { data, mutate } = useConditionalSWR(
        isEnterprise() && user !== undefined,
        undefined,
        formatApiPath(
            `api/admin/search/change-requests?requestedApproverId=IS:${user?.id}&state=IS:open&limit=1`,
        ),
        fetcher,
    );

    return { total: data?.total, refetch: mutate };
};
