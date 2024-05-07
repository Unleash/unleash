import type React from 'react';
import { styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface SsoGroupSettingsProps {
    ssoType: 'OIDC' | 'SAML';
    data?: {
        enabled: boolean;
        enableGroupSyncing: boolean;
        groupJsonPath: string;
        addGroupsScope: boolean;
    };
    setValue: (name: string, value: string | boolean) => void;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    minHeight: '280px',
}));

const StyledCardTitleRow = styled('div')(({ theme }) => ({
    padding: theme.spacing(2.5),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `2px solid ${theme.palette.divider}`,
}));

const StyledContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(2.5),
}));

export const SsoGroupSettings = ({
    ssoType,
    data = {
        enabled: false,
        enableGroupSyncing: false,
        groupJsonPath: '',
        addGroupsScope: false,
    },
    setValue,
}: SsoGroupSettingsProps) => {
    const updateGroupSyncing = () => {
        setValue('enableGroupSyncing', !data.enableGroupSyncing);
    };

    const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.name, event.target.value);
    };

    const updateAddGroupScope = () => {
        setValue('addGroupsScope', !data.addGroupsScope);
    };
    return (
        <>
            <StyledContainer>
                <StyledCardTitleRow>
                    Group syncing
                    <Badge color='warning'>Legacy</Badge>
                </StyledCardTitleRow>
                <StyledContent>
                    <Grid container spacing={5} mb={1}>
                        <Grid item md={6}>
                            <strong>Enable Group Syncing</strong>
                        </Grid>
                        <Grid item md={4} />
                        <Grid item md={2} style={{ textAlign: 'right' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        onChange={updateGroupSyncing}
                                        value={data.enableGroupSyncing}
                                        name='enableGroupSyncing'
                                        checked={data.enableGroupSyncing}
                                        disabled={!data.enabled}
                                    />
                                }
                                label=''
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={8}>
                        <Grid item md={6}>
                            <strong>Group Field JSON Path</strong>
                            <p>
                                Specifies the path in the {ssoType} token
                                response from which to read the groups the user
                                belongs to.
                            </p>
                        </Grid>
                        <Grid item md={6}>
                            <TextField
                                onChange={updateField}
                                label='Group JSON Path'
                                name='groupJsonPath'
                                value={data.groupJsonPath}
                                disabled={!data.enableGroupSyncing}
                                style={{ width: 'auto' }}
                                variant='outlined'
                                size='small'
                                required
                            />
                        </Grid>
                    </Grid>
                    <ConditionallyRender
                        condition={ssoType === 'OIDC'}
                        show={
                            <Grid container spacing={3} mt={3}>
                                <Grid item md={5}>
                                    <strong>Request 'groups' Scope</strong>
                                    <p>
                                        When enabled Unleash will also request
                                        the 'groups' scope as part of the login
                                        request.
                                    </p>
                                </Grid>
                                <Grid item md={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                onChange={updateAddGroupScope}
                                                value={data.addGroupsScope}
                                                disabled={
                                                    !data.enableGroupSyncing
                                                }
                                                name='addGroupsScope'
                                                checked={data.addGroupsScope}
                                            />
                                        }
                                        label={
                                            data.addGroupsScope
                                                ? 'Enabled'
                                                : 'Disabled'
                                        }
                                    />
                                </Grid>
                            </Grid>
                        }
                    />
                </StyledContent>
            </StyledContainer>
        </>
    );
};
