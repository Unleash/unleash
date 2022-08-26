import { Button, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const GroupEmpty = () => {
    const StyledContainerDiv = styled('div')(({ theme }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: theme.spacing(6),
        marginLeft: 'auto',
        marginRight: 'auto',
    }));

    const StyledTitle = styled(Typography)(({ theme }) => ({
        fontSize: theme.fontSizes.bodySize,
        marginBottom: theme.spacing(2.5),
    }));

    return (
        <StyledContainerDiv>
            <StyledTitle>
                No groups available. Get started by adding a new group.
            </StyledTitle>
            <Button
                to="/admin/groups/create-group"
                component={Link}
                variant="outlined"
                color="secondary"
            >
                Create your first group
            </Button>
        </StyledContainerDiv>
    );
};
