import React, { useState } from 'react';
import ConditionallyRender from '../../../common/ConditionallyRender';
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
import { useStyles } from './UserProfileContent.styles';
import { useCommonStyles } from '../../../../common.styles';
import { Alert } from '@material-ui/lab';
import EditProfile from '../EditProfile/EditProfile';
import legacyStyles from '../../user.module.scss';
import { getBasePath } from '../../../../utils/format-path';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import { IUser } from '../../../../interfaces/user';

interface IUserProfileContentProps {
    showProfile: boolean;
    profile: IUser;
    possibleLocales: string[];
    updateSettingLocation: (field: 'locale', value: string) => void;
    imageUrl: string;
    currentLocale?: string;
    setCurrentLocale: (value: string) => void;
}

const UserProfileContent = ({
    showProfile,
    profile,
    possibleLocales,
    updateSettingLocation,
    imageUrl,
    currentLocale,
    setCurrentLocale,
}: IUserProfileContentProps) => {
    const commonStyles = useCommonStyles();
    const { uiConfig } = useUiConfig();
    const [updatedPassword, setUpdatedPassword] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const styles = useStyles();

    const setLocale = (value: string) => {
        updateSettingLocation('locale', value);
    };

    // @ts-expect-error
    const profileAvatarClasses = classnames(styles.avatar, {
        // @ts-expect-error
        [styles.editingAvatar]: editingProfile,
    });

    // @ts-expect-error
    const profileEmailClasses = classnames(styles.profileEmail, {
        // @ts-expect-error
        [styles.editingEmail]: editingProfile,
    });

    const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        const value = e.target.value as string;
        setCurrentLocale(value);
        setLocale(value);
    };

    return (
        <ConditionallyRender
            condition={showProfile}
            show={
                <Paper
                    className={classnames(
                        // @ts-expect-error
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
                                    // @ts-expect-error
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
