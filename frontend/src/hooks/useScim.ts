import { useScimSettingsApi } from 'hooks/api/actions/useScimSettingsApi/useScimSettingsApi';
import { useEffect, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import { useScimSettings } from './api/getters/useScimSettings/useScimSettings';

export const useScim = () => {
    const [newToken, setNewToken] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [tokenGenerationDialog, setTokenGenerationDialog] = useState(false);
    const [tokenDialog, setTokenDialog] = useState(false);
    const [assumeControlOfExisting, setAssumeControlOfExisting] =
        useState(false);

    const { saveSettings, generateNewToken, errors, loading } =
        useScimSettingsApi();

    const { settings, refetch } = useScimSettings();
    const { setToastData, setToastApiError } = useToast();
    const saveScimSettings = async () => {
        try {
            await saveSettings({ enabled, assumeControlOfExisting });
            if (enabled && !settings.hasToken) {
                const token = await generateNewToken();
                setNewToken(token);
                setTokenDialog(true);
            }

            setToastData({
                title: 'Settings stored',
                type: 'success',
            });
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onGenerateNewTokenConfirm = async () => {
        setTokenGenerationDialog(false);
        const token = await generateNewToken();
        setNewToken(token);
        setTokenDialog(true);
    };

    useEffect(() => {
        setEnabled(settings.enabled ?? false);
        setAssumeControlOfExisting(settings.assumeControlOfExisting ?? false);
    }, [settings]);

    return {
        settings,
        enabled,
        setEnabled,
        assumeControlOfExisting,
        setAssumeControlOfExisting,
        newToken,
        tokenGenerationDialog,
        setTokenGenerationDialog,
        tokenDialog,
        setTokenDialog,
        loading,
        saveScimSettings,
        onGenerateNewTokenConfirm,
    };
};
