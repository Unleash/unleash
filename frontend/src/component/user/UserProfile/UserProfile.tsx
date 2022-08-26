import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { Avatar, Button, ClickAwayListener } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useStyles } from 'component/user/UserProfile/UserProfile.styles';
import { useThemeStyles } from 'themes/themeStyles';
import UserProfileContent from './UserProfileContent/UserProfileContent';
import { IUser } from 'interfaces/user';
import { ILocationSettings } from 'hooks/useLocationSettings';
import { HEADER_USER_AVATAR } from 'utils/testIds';
import unknownUser from 'assets/icons/unknownUser.png';
import { useId } from 'hooks/useId';

interface IUserProfileProps {
    profile: IUser;
    locationSettings: ILocationSettings;
    setLocationSettings: React.Dispatch<
        React.SetStateAction<ILocationSettings>
    >;
}

const UserProfile = ({
    profile,
    locationSettings,
    setLocationSettings,
}: IUserProfileProps) => {
    const [showProfile, setShowProfile] = useState(false);
    const [currentLocale, setCurrentLocale] = useState<string>();
    const modalId = useId();

    const { classes: styles } = useStyles();
    const { classes: themeStyles } = useThemeStyles();

    const [possibleLocales, setPossibleLocales] = useState([
        'en-US',
        'en-GB',
        'nb-NO',
        'sv-SE',
        'da-DK',
        'en-IN',
        'de',
        'cs',
        'pt-BR',
        'fr-FR',
    ]);

    useEffect(() => {
        let found = possibleLocales.find(l =>
            l.toLowerCase().includes(locationSettings.locale.toLowerCase())
        );
        setCurrentLocale(found);
        if (!found) {
            setPossibleLocales(prev => [...prev, locationSettings.locale]);
        }
        /* eslint-disable-next-line*/
    }, [locationSettings]);

    const email = profile ? profile.email : '';
    const imageUrl = email ? profile.imageUrl : unknownUser;

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
                    <Avatar
                        style={{ backgroundColor: '#fff' }}
                        alt="Your Gravatar"
                        src={imageUrl}
                        data-testid={HEADER_USER_AVATAR}
                    />
                    <KeyboardArrowDownIcon className={styles.icon} />
                </Button>
                <UserProfileContent
                    id={modalId}
                    showProfile={showProfile}
                    imageUrl={imageUrl}
                    profile={profile}
                    setLocationSettings={setLocationSettings}
                    possibleLocales={possibleLocales}
                    setCurrentLocale={setCurrentLocale}
                    currentLocale={currentLocale}
                />
            </div>
        </ClickAwayListener>
    );
};

export default UserProfile;
