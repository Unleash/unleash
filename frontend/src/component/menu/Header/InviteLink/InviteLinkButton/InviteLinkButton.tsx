import { useContext } from 'react';
import { Button } from '@mui/material';
import AccessContext from 'contexts/AccessContext';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { Link } from 'react-router';

const InviteLinkButton = () => {
    const { isAdmin } = useContext(AccessContext);

    if (!isAdmin) {
        return null;
    }

    return (
        <Button
            component={Link}
            to='/admin/users'
            variant='outlined'
            color='inherit'
            startIcon={<PersonAdd />}
            aria-label='Invite users'
            sx={(theme) => ({
                mx: 1,
                color: theme.palette.neutral.main,
                borderColor: theme.palette.neutral.containerBorder,
                '&:hover': {
                    color: theme.palette.neutral.dark,
                    borderColor: theme.palette.neutral.main,
                    backgroundColor: theme.palette.neutral.container,
                },
            })}
        >
            Invite
        </Button>
    );
};

export default InviteLinkButton;
