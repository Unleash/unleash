import { Button, FormControlLabel, Grid, Switch } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ScimTokenGenerationDialog } from './ScimTokenGenerationDialog';
import { ScimTokenDialog } from './ScimTokenDialog';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { ScimSettings } from 'hooks/api/getters/useScimSettings/useScimSettings';
import { styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';

export interface IScimSettingsParameters {
    disabled: boolean;
    loading: boolean;
    enabled: boolean;
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    assumeControlOfExisting: boolean;
    setAssumeControlOfExisting: React.Dispatch<React.SetStateAction<boolean>>;
    newToken: string;
    settings: ScimSettings;
    tokenGenerationDialog: boolean;
    setTokenGenerationDialog: React.Dispatch<React.SetStateAction<boolean>>;
    onGenerateNewTokenConfirm: () => void;
    tokenDialog: boolean;
    setTokenDialog: React.Dispatch<React.SetStateAction<boolean>>;
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

export const ScimConfigSettings = ({
    disabled,
    loading,
    enabled,
    setEnabled,
    assumeControlOfExisting,
    setAssumeControlOfExisting,
    newToken,
    settings,
    tokenGenerationDialog,
    setTokenGenerationDialog,
    onGenerateNewTokenConfirm,
    tokenDialog,
    setTokenDialog,
}: IScimSettingsParameters) => {
    const { uiConfig } = useUiConfig();

    const onGenerateNewToken = async () => {
        setTokenGenerationDialog(true);
    };

    return (
        <>
            <StyledContainer>
                <StyledCardTitleRow>
                    SCIM Provisioning
                    <Badge color='secondary'>Recommended</Badge>
                </StyledCardTitleRow>
                <StyledContent>
                    <Grid container spacing={3}>
                        <Grid item md={10} mb={3}>
                            <strong>Enable</strong>
                        </Grid>
                        <Grid item md={2} style={{ textAlign: 'right' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        onChange={(_, enabled) =>
                                            setEnabled(enabled)
                                        }
                                        value={enabled}
                                        name='enabled'
                                        checked={enabled}
                                        disabled={disabled}
                                    />
                                }
                                label=''
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item md={10} mb={3}>
                            <strong>Assume control</strong>
                        </Grid>
                        <Grid item md={2} style={{ textAlign: 'right' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        onChange={(_, set_enabled) =>
                                            setAssumeControlOfExisting(
                                                set_enabled,
                                            )
                                        }
                                        value={assumeControlOfExisting}
                                        name='assumeControlOfExisting'
                                        checked={assumeControlOfExisting}
                                        disabled={disabled}
                                    />
                                }
                                label=''
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item md={7} mb={2}>
                            <ConditionallyRender
                                condition={
                                    Boolean(settings.hasToken) && enabled
                                }
                                show={
                                    <Button
                                        variant='outlined'
                                        color='error'
                                        disabled={loading}
                                        onClick={onGenerateNewToken}
                                    >
                                        Generate new token
                                    </Button>
                                }
                            />
                        </Grid>
                    </Grid>
                    <ScimTokenGenerationDialog
                        open={tokenGenerationDialog}
                        setOpen={setTokenGenerationDialog}
                        onConfirm={onGenerateNewTokenConfirm}
                    />
                    <ScimTokenDialog
                        open={tokenDialog}
                        setOpen={setTokenDialog}
                        token={newToken}
                    />
                </StyledContent>
            </StyledContainer>
        </>
    );
};
