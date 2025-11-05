import Add from '@mui/icons-material/Add';
import { StyledAddActionButton } from './ReleasePlanCommonComponets.tsx';

export const ReleasePlanAddSafeguard = () => {
    return (
        <StyledAddActionButton color='primary' startIcon={<Add />}>
            Add safeguard
        </StyledAddActionButton>
    );
};
