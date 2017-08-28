export const USER_UPDATE_USERNAME = 'USER_UPDATE_USERNAME';
export const USER_SAVE = 'USER_SAVE';
export const USER_EDIT = 'USER_EDIT';

export const updateUserName = value => ({
    type: USER_UPDATE_USERNAME,
    value,
});

export const save = () => ({
    type: USER_SAVE,
});

export const openEdit = () => ({
    type: USER_EDIT,
});
