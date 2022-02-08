import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';

import { Avatar, Button } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { useStyles } from './UserProfile.styles';
import { useCommonStyles } from '../../../common.styles';
import UserProfileContent from './UserProfileContent/UserProfileContent';
import { IUser } from "../../../interfaces/user";
import { ILocationSettings } from "../../../hooks/useLocationSettings";

interface IUserProfileProps {
    profile: IUser
    locationSettings: ILocationSettings
    setLocationSettings: React.Dispatch<React.SetStateAction<ILocationSettings>>
}

const UserProfile = ({
    profile,
    locationSettings,
    setLocationSettings,
}: IUserProfileProps) => {
    const [showProfile, setShowProfile] = useState(false);
    const [currentLocale, setCurrentLocale] = useState<string>();

    const styles = useStyles();
    const commonStyles = useCommonStyles();

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
    const imageUrl = email ? profile.imageUrl : 'unknown-user.png';

    return (
        <OutsideClickHandler onOutsideClick={() => setShowProfile(false)}>
            <div className={styles.profileContainer}>
                <Button
                    className={classnames(
                        commonStyles.flexRow,
                        commonStyles.itemsCenter,
                        styles.button
                    )}
                    onClick={() => setShowProfile(prev => !prev)}
                    role="button"
                    disableRipple
                >
                    <Avatar alt="user image" src={imageUrl} />
                    <KeyboardArrowDownIcon />
                </Button>
                <UserProfileContent
                    showProfile={showProfile}
                    imageUrl={imageUrl}
                    profile={profile}
                    setLocationSettings={setLocationSettings}
                    possibleLocales={possibleLocales}
                    setCurrentLocale={setCurrentLocale}
                    currentLocale={currentLocale}
                />
            </div>
        </OutsideClickHandler>
    );
};

export default UserProfile;
