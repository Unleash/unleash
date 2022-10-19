import { useState } from 'react';
import classnames from 'classnames';
import { Button, ClickAwayListener, styled } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useStyles } from 'component/user/UserProfile/UserProfile.styles';
import { useThemeStyles } from 'themes/themeStyles';
import { UserProfileContent } from './UserProfileContent/UserProfileContent';
import { IUser } from 'interfaces/user';
import { HEADER_USER_AVATAR } from 'utils/testIds';
import { useId } from 'hooks/useId';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
}));

interface IUserProfileProps {
    profile: IUser;
}

const UserProfile = ({ profile }: IUserProfileProps) => {
    const [showProfile, setShowProfile] = useState(false);
    const modalId = useId();

    const { classes: styles } = useStyles();
    const { classes: themeStyles } = useThemeStyles();

    return (
        <ClickAwayListener onClickAway={() => setShowProfile(false)}>
            <div className={styles.profileContainer}>
                <Button
                    className={classnames(
                        themeStyles.flexRow,
                        themeStyles.itemsCenter,
                        themeStyles.focusable,
                        styles.button
                    )}
                    onClick={() => setShowProfile(prev => !prev)}
                    aria-controls={showProfile ? modalId : undefined}
                    aria-expanded={showProfile}
                    color="secondary"
                    disableRipple
                >
                    <StyledUserAvatar
                        user={profile}
                        data-testid={HEADER_USER_AVATAR}
                    />
                    <KeyboardArrowDownIcon className={styles.icon} />
                </Button>
                <UserProfileContent
                    id={modalId}
                    showProfile={showProfile}
                    setShowProfile={setShowProfile}
                    profile={profile}
                />
            </div>
        </ClickAwayListener>
    );
};

export default UserProfile;
