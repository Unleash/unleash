import { Typography } from '@mui/material';
import { useThemeStyles } from 'themes/themeStyles';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { UserToken } from './UserToken/UserToken';

interface IConfirmUserLink {
    open: boolean;
    closeConfirm: () => void;
    token: string;
}

export const ConfirmToken = ({
    open,
    closeConfirm,
    token,
}: IConfirmUserLink) => {
    const { classes: themeStyles } = useThemeStyles();

    return (
        <Dialogue
            open={open}
            onClick={closeConfirm}
            primaryButtonText="Close"
            title="New token created"
        >
            <div className={themeStyles.contentSpacingYLarge}>
                <Typography variant="body1">
                    Your new token has been created successfully.
                </Typography>
                <UserToken token={token} />
            </div>
        </Dialogue>
    );
};
