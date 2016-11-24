export const UPDATE_SETTING = 'UPDATE_SETTING';

export const updateSetting = (group, field, value) => ({
    type: UPDATE_SETTING,
    group,
    field,
    value,
});

export const updateSettingForGroup = (group) => (field, value) => updateSetting(group, field, value);
