import useQueryParams from 'hooks/useQueryParams';

export const useInviteUserToken = () => {
    const query = useQueryParams();
    const invite = query.get('invite') || '';

    // TODO: Invite token API

    return { invite, loading: false };
};
