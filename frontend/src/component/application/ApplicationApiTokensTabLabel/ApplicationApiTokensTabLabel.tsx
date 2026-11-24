import { styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { useApplicationApiTokens } from 'hooks/api/getters/useApplicationApiTokens/useApplicationApiTokens';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

const StyledTabLabel = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

export const ApplicationApiTokensTabLabel = () => {
    const name = useRequiredPathParam('name');
    const { tokens, loading, error, forbidden } = useApplicationApiTokens(name);

    return (
        <StyledTabLabel>
            Tokens
            {loading || error || forbidden ? null : (
                <Badge>{tokens.length}</Badge>
            )}
        </StyledTabLabel>
    );
};
