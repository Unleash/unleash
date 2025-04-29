import ConfirmUserEmail from './ConfirmUserEmail/ConfirmUserEmail.tsx';
import ConfirmUserLink from './ConfirmUserLink/ConfirmUserLink.tsx';

interface IConfirmUserAddedProps {
    open: boolean;
    closeConfirm: () => void;
    inviteLink: string;
    emailSent: boolean;
}

const ConfirmUserAdded = ({
    open,
    closeConfirm,
    emailSent,
    inviteLink,
}: IConfirmUserAddedProps) => {
    if (emailSent) {
        return (
            <ConfirmUserEmail
                open={open}
                closeConfirm={closeConfirm}
                inviteLink={inviteLink}
            />
        );
    }

    return (
        <ConfirmUserLink
            open={open}
            closeConfirm={closeConfirm}
            inviteLink={inviteLink}
        />
    );
};

export default ConfirmUserAdded;
