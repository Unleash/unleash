import { type ChangeEvent, useMemo, useState } from 'react';
import { Grid, TextField, styled } from '@mui/material';
import { useThemeStyles } from 'themes/themeStyles';
import icons from 'component/application/iconNames';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import useApplicationsApi from 'hooks/api/actions/useApplicationsApi/useApplicationsApi';
import useToast from 'hooks/useToast';
import type { IApplication } from 'interfaces/application';
import useApplication from 'hooks/api/getters/useApplication/useApplication';
import { formatUnknownError } from 'utils/formatUnknownError';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

interface IApplicationUpdateProps {
    application: IApplication;
}

const StyledSelectContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

export const ApplicationUpdate = ({ application }: IApplicationUpdateProps) => {
    const { storeApplicationMetaData } = useApplicationsApi();
    const { appName, icon, url, description } = application;
    const { refetchApplication } = useApplication(appName);
    const [localUrl, setLocalUrl] = useState(url || '');
    const [localDescription, setLocalDescription] = useState(description || '');
    const { setToastData, setToastApiError } = useToast();
    const { classes: themeStyles } = useThemeStyles();

    const onChange = async (
        field: string,
        value: string,
        event?: ChangeEvent,
    ) => {
        event?.preventDefault();
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

    const options = useMemo(() => icons.map((v) => ({ key: v, label: v })), []);

    return (
        <Grid container style={{ marginTop: '1rem' }}>
            <Grid item sm={12} xs={12} className={themeStyles.contentSpacingY}>
                <Grid item>
                    <StyledSelectContainer>
                        <GeneralSelect
                            name='iconSelect'
                            id='selectIcon'
                            label='Icon'
                            options={options}
                            value={icon || 'apps'}
                            onChange={(key) => onChange('icon', key)}
                        />
                        <HelpIcon
                            htmlTooltip
                            tooltip={
                                <>
                                    <p>Unleash is using Material Icons</p>
                                    <br />
                                    <a
                                        href='https://mui.com/material-ui/material-icons/'
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        Preview icons on MUI.com
                                    </a>
                                </>
                            }
                        />
                    </StyledSelectContainer>
                </Grid>
                <Grid item>
                    <TextField
                        value={localUrl}
                        onChange={(e) => setLocalUrl(e.target.value)}
                        label='Application URL'
                        placeholder='https://example.com'
                        type='url'
                        variant='outlined'
                        size='small'
                        onBlur={(e) => onChange('url', localUrl, e)}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        value={localDescription}
                        label='Description'
                        variant='outlined'
                        size='small'
                        rows={2}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        onBlur={(e) =>
                            onChange('description', localDescription, e)
                        }
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
