import React, { useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    Avatar,
    Button,
    FormControl,
    InputLabel,
    Paper,
    Select,
    Typography,
    SelectChangeEvent,
    Alert,
} from '@mui/material';
import classnames from 'classnames';
import { useStyles } from 'component/user/UserProfile/UserProfileContent/UserProfileContent.styles';
import { useThemeStyles } from 'themes/themeStyles';
import EditProfile from '../EditProfile/EditProfile';
import legacyStyles from '../../user.module.scss';
import { basePath } from 'utils/formatPath';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IUser } from 'interfaces/user';
import { ILocationSettings } from 'hooks/useLocationSettings';
import { useTheme } from '@mui/material/styles';

interface IUserProfileContentProps {
    id: string;
    showProfile: boolean;
    profile: IUser;
    possibleLocales: string[];
    imageUrl: string;
    currentLocale?: string;
    setCurrentLocale: (value: string) => void;
    setLocationSettings: React.Dispatch<
        React.SetStateAction<ILocationSettings>
    >;
}

const UserProfileContent = ({
    id,
    showProfile,
    profile,
    possibleLocales,
    imageUrl,
    currentLocale,
    setCurrentLocale,
    setLocationSettings,
}: IUserProfileContentProps) => {
    const { classes: themeStyles } = useThemeStyles();
    const theme = useTheme();

    const { uiConfig } = useUiConfig();
    const [updatedPassword, setUpdatedPassword] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const { classes: styles } = useStyles();

    const profileAvatarClasses = classnames(styles.avatar, {
        [styles.editingAvatar]: editingProfile,
    });

    const profileEmailClasses = classnames(styles.profileEmail, {
        [styles.editingEmail]: editingProfile,
    });

    const handleChange = (e: SelectChangeEvent) => {
        const locale = e.target.value;
        setCurrentLocale(locale);
        setLocationSettings({ locale });
    };

    return (
        <ConditionallyRender
            condition={showProfile}
            show={
                <Paper
                    id={id}
                    className={classnames(
                        styles.profile,
                        themeStyles.flexColumn,
                        themeStyles.itemsCenter,
                        themeStyles.contentSpacingY
                    )}
                >
                    <Avatar
                        alt="Your Gravatar"
                        src={imageUrl}
                        className={profileAvatarClasses}
                    />
                    <Typography variant="body1" className={profileEmailClasses}>
                        {profile?.email}
                    </Typography>
                    <ConditionallyRender
                        condition={updatedPassword}
                        show={
                            <Alert onClose={() => setUpdatedPassword(false)}>
                                Successfully updated password.
                            </Alert>
                        }
                    />
                    <ConditionallyRender
                        condition={!editingProfile}
                        show={
                            <>
                                <ConditionallyRender
                                    condition={!uiConfig.disablePasswordAuth}
                                    show={
                                        <Button
                                            onClick={() =>
                                                setEditingProfile(true)
                                            }
                                        >
                                            Update password
                                        </Button>
                                    }
                                />
                                <div className={themeStyles.divider} />
                                <div className={legacyStyles.showUserSettings}>
                                    <FormControl
                                        variant="outlined"
                                        size="small"
                                        style={{
                                            width: '100%',
                                            minWidth: '120px',
                                        }}
                                    >
                                        <InputLabel
                                            htmlFor="locale-select"
                                            style={{
                                                backgroundColor:
                                                    theme.palette
                                                        .inputLabelBackground,
                                            }}
                                        >
                                            Date/Time formatting
                                        </InputLabel>
                                        <Select
                                            id="locale-select"
                                            value={currentLocale || ''}
                                            native
                                            onChange={handleChange}
                                            MenuProps={{
                                                style: {
                                                    zIndex: 9999,
                                                },
                                            }}
                                        >
                                            {possibleLocales.map(locale => {
                                                return (
                                                    <option
                                                        key={locale}
                                                        value={locale}
                                                    >
                                                        {locale}
                                                    </option>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className={themeStyles.divider} />
                                <a
                                    className={styles.link}
                                    href="https://www.getunleash.io/privacy-policy"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Privacy policy
                                </a>
                                <div className={themeStyles.divider} />

                                <Button
                                    variant="contained"
                                    color="primary"
                                    href={`${basePath}/logout`}
                                >
                                    Logout
                                </Button>
                            </>
                        }
                        elseShow={
                            <EditProfile
                                setEditingProfile={setEditingProfile}
                                setUpdatedPassword={setUpdatedPassword}
                            />
                        }
                    />
                </Paper>
            }
        />
    );
};

export default UserProfileContent;
