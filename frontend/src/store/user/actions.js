export const USER_UPDATE_USERNAME = 'USER_UPDATE_USERNAME';
export const USER_SAVE = 'USER_SAVE';

export const updateUserName = (value) => ({
    type: USER_UPDATE_USERNAME,
    value,
});

export const save = () => ({
    type: USER_SAVE,
});
