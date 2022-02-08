import { useEffect, useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import OutsideClickHandler from 'react-outside-click-handler';

import { Avatar, Button } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { useStyles } from './UserProfile.styles';
import { useCommonStyles } from '../../../common.styles';
import UserProfileContent from './UserProfileContent/UserProfileContent';
import { IUser } from '../../../interfaces/user';

interface IUserProfileProps {
    profile: IUser;
    updateSettingLocation: (field: 'locale', value: string) => void;
}

const UserProfile = ({
    profile,
    location,
    updateSettingLocation,
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
        const locale = location.locale || navigator.language;
        let found = possibleLocales.find(l =>
            l.toLowerCase().includes(locale.toLowerCase())
        );
        setCurrentLocale(found);

        if (!found) {
            setPossibleLocales(prev => [...prev, locale]);
        }
        /* eslint-disable-next-line*/
    }, []);

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
                    updateSettingLocation={updateSettingLocation}
                    possibleLocales={possibleLocales}
                    setCurrentLocale={setCurrentLocale}
                    currentLocale={currentLocale}
                />
            </div>
        </OutsideClickHandler>
    );
};

UserProfile.propTypes = {
    profile: PropTypes.object,
    location: PropTypes.object,
    updateSettingLocation: PropTypes.func.isRequired,
};

export default UserProfile;
