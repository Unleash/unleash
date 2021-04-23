import { useEffect, useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import OutsideClickHandler from 'react-outside-click-handler';

import { Avatar, Button } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { useStyles } from './UserProfile.styles';
import { useCommonStyles } from '../../../common.styles';
import UserProfileContent from './UserProfileContent/UserProfileContent';

const UserProfile = ({
    profile,
    location,
    fetchUser,
    updateSettingLocation,
    logoutUser,
}) => {
    const [showProfile, setShowProfile] = useState(false);

    const styles = useStyles();
    const commonStyles = useCommonStyles();

    const [possibleLocales, setPossibleLocales] = useState([
        { value: 'en-US', image: 'en-US' },
        { value: 'en-GB', image: 'en-GB' },
        { value: 'nb-NO', image: 'nb-NO' },
        { value: 'sv-SE', image: 'sv-SE' },
        { value: 'da-DK', image: 'da-DK' },
        { value: 'en-IN', image: 'en-IN' },
        { value: 'de', image: 'de_DE' },
        { value: 'cs', image: 'cs_CZ' },
        { value: 'pt-BR', image: 'pt_BR' },
        { value: 'fr-FR', image: 'fr-FR' },
    ]);

    useEffect(() => {
        fetchUser();

        const locale = navigator.language || navigator.userLanguage;
        let found = possibleLocales.find(l => l.value === locale);
        if (!found) {
            setPossibleLocales(prev => ({
                ...prev,
                value: locale,
                image: 'unknown-locale',
            }));
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
                    tabIndex="1"
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
                    logoutUser={logoutUser}
                    location={location}
                />
            </div>
        </OutsideClickHandler>
    );
};

UserProfile.propTypes = {
    profile: PropTypes.object,
    location: PropTypes.object,
    fetchUser: PropTypes.func.isRequired,
    updateSettingLocation: PropTypes.func.isRequired,
};

export default UserProfile;
