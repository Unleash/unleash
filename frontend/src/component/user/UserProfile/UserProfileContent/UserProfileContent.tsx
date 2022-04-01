import React, { useState } from 'react';
import ConditionallyRender from 'component/common/ConditionallyRender';
import {
    Avatar,
    Button,
    FormControl,
    InputLabel,
    Paper,
    Select,
    Typography,
} from '@material-ui/core';
import classnames from 'classnames';
import { useStyles } from 'component/user/UserProfile/UserProfileContent/UserProfileContent.styles';
import { useCommonStyles } from 'themes/commonStyles';
import { Alert } from '@material-ui/lab';
import EditProfile from '../EditProfile/EditProfile';
import legacyStyles from '../../user.module.scss';
import { getBasePath } from 'utils/formatPath';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IUser } from 'interfaces/user';
import { ILocationSettings } from 'hooks/useLocationSettings';

interface IUserProfileContentProps {
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
    showProfile,
    profile,
    possibleLocales,
    imageUrl,
    currentLocale,
    setCurrentLocale,
    setLocationSettings,
}: IUserProfileContentProps) => {
    const commonStyles = useCommonStyles();
    const { uiConfig } = useUiConfig();
    const [updatedPassword, setUpdatedPassword] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const styles = useStyles();

    const profileAvatarClasses = classnames(styles.avatar, {
        [styles.editingAvatar]: editingProfile,
    });

    const profileEmailClasses = classnames(styles.profileEmail, {
        [styles.editingEmail]: editingProfile,
    });

    const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        const locale = e.target.value as string;
        setCurrentLocale(locale);
        setLocationSettings({ locale });
    };

    return (
        <ConditionallyRender
            condition={showProfile}
            show={
                <Paper
                    className={classnames(
                        styles.profile,
                        commonStyles.flexColumn,
                        commonStyles.itemsCenter,
                        commonStyles.contentSpacingY
                    )}
                >
                    <Avatar
                        alt="user image"
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
                                            variant="contained"
                                            onClick={() =>
                                                setEditingProfile(true)
                                            }
                                        >
                                            Update password
                                        </Button>
                                    }
                                />
                                <div className={commonStyles.divider} />
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
                                            style={{ backgroundColor: '#fff' }}
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
                                <div className={commonStyles.divider} />
                                <a
                                    className={styles.link}
                                    href="https://www.getunleash.io/privacy-policy"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Privacy policy
                                </a>
                                <div className={commonStyles.divider} />

                                <Button
                                    variant="contained"
                                    color="primary"
                                    href={`${getBasePath()}/logout`}
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
