import { useState } from 'react';
import { TextField, Grid } from '@material-ui/core';
import { useCommonStyles } from '../../common.styles';
import icons from './icon-names';
import GeneralSelect from '../common/GeneralSelect/GeneralSelect';
import useApplicationsApi from '../../hooks/api/actions/useApplicationsApi/useApplicationsApi';

const ApplicationUpdate = ({ application }) => {
    const { storeApplicationMetaData } = useApplicationsApi();
    const { appName, icon, url, description } = application;
    const [localUrl, setLocalUrl] = useState(url);
    const [localDescription, setLocalDescription] = useState(description);
    const commonStyles = useCommonStyles();

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
                            storeApplicationMetaData(
                                appName,
                                'icon',
                                e.target.value as string
                            )
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
                        onBlur={() =>
                            storeApplicationMetaData(appName, 'url', localUrl)
                        }
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
                        onBlur={() =>
                            storeApplicationMetaData(
                                appName,
                                'description',
                                localDescription
                            )
                        }
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};

export default ApplicationUpdate;
