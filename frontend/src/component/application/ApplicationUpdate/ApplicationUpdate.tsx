import { ChangeEvent, useState } from 'react';
import { Grid, TextField } from '@material-ui/core';
import { useCommonStyles } from 'themes/commonStyles';
import icons from 'component/application/iconNames';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import useApplicationsApi from 'hooks/api/actions/useApplicationsApi/useApplicationsApi';
import useToast from 'hooks/useToast';
import { IApplication } from 'interfaces/application';
import useApplication from 'hooks/api/getters/useApplication/useApplication';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IApplicationUpdateProps {
    application: IApplication;
}

export const ApplicationUpdate = ({ application }: IApplicationUpdateProps) => {
    const { storeApplicationMetaData } = useApplicationsApi();
    const { appName, icon, url, description } = application;
    const { refetchApplication } = useApplication(appName);
    const [localUrl, setLocalUrl] = useState(url || '');
    const [localDescription, setLocalDescription] = useState(description || '');
    const { setToastData, setToastApiError } = useToast();
    const commonStyles = useCommonStyles();

    const handleChange = async (
        evt: ChangeEvent<{ name?: string | undefined; value: unknown }>,
        field: string,
        value: string
    ) => {
        evt.preventDefault();
        try {
            await storeApplicationMetaData(appName, field, value);
            refetchApplication();
            setToastData({
                type: 'success',
                title: 'Updated Successfully',
                text: `${field} successfully updated`,
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <Grid container style={{ marginTop: '1rem' }}>
            <Grid item sm={12} xs={12} className={commonStyles.contentSpacingY}>
                <Grid item>
                    <GeneralSelect
                        name="iconSelect"
                        id="selectIcon"
                        label="Icon"
                        options={icons.map(v => ({ key: v, label: v }))}
                        value={icon || 'apps'}
                        onChange={e =>
                            handleChange(e, 'icon', e.target.value as string)
                        }
                    />
                </Grid>
                <Grid item>
                    <TextField
                        value={localUrl}
                        onChange={e => setLocalUrl(e.target.value)}
                        label="Application URL"
                        placeholder="https://example.com"
                        type="url"
                        variant="outlined"
                        size="small"
                        onBlur={e => handleChange(e, 'url', localUrl)}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        value={localDescription}
                        label="Description"
                        variant="outlined"
                        size="small"
                        rows={2}
                        onChange={e => setLocalDescription(e.target.value)}
                        onBlur={e =>
                            handleChange(e, 'description', localDescription)
                        }
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
