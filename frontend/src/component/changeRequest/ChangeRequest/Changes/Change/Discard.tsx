import React, { FC } from 'react';
import { IChangeRequest } from '../../../changeRequest.types';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { changesCount } from '../../../changesCount';
import { Box, Link, styled } from '@mui/material';

const useShowDiscard = (changeRequest: IChangeRequest) => {
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(
        changeRequest.project
    );
    const allowChangeRequestActions = isChangeRequestConfigured(
        changeRequest.environment
    );
    const isPending = !['Cancelled', 'Applied'].includes(changeRequest.state);

    const { user } = useAuthUser();
    const isAuthor = user?.id === changeRequest.createdBy.id;

    const showDiscard =
        allowChangeRequestActions &&
        isPending &&
        isAuthor &&
        changesCount(changeRequest) > 1;

    return showDiscard;
};

const StyledLink = styled(Link)(() => ({
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const Discard: FC<{ onDiscard: () => void }> = ({ onDiscard }) => (
    <Box>
        <StyledLink onClick={onDiscard}>Discard</StyledLink>
    </Box>
);

export const DiscardContainer: FC<{
    changeRequest: IChangeRequest;
    changeId: number;
    onPostDiscard?: () => void;
}> = ({ changeRequest, changeId, onPostDiscard }) => {
    const showDiscard = useShowDiscard(changeRequest);
    const { discardChange } = useChangeRequestApi();
    const { setToastData, setToastApiError } = useToast();

    const onDiscard = (id: number) => async () => {
        try {
            await discardChange(changeRequest.project, changeRequest.id, id);
            setToastData({
                title: 'Change discarded from change request draft.',
                type: 'success',
            });
            onPostDiscard?.();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <ConditionallyRender
            condition={showDiscard}
            show={<Discard onDiscard={onDiscard(changeId)} />}
        />
    );
};
