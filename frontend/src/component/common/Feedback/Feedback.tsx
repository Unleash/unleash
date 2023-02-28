import { useState, VFC } from 'react';
import { Box, Paper, Button, styled } from '@mui/material';
import { CustomEvents, usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { createLocalStorage } from 'utils/createLocalStorage';

interface IFeedbackProps {
    id: string;
    eventName: CustomEvents;
    localStorageKey: string;
}

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.5),
}));

export const Feedback: VFC<IFeedbackProps> = ({
    id,
    localStorageKey,
    eventName,
}) => {
    const { uiConfig } = useUiConfig();
    const { value: selectedValue, setValue: setSelectedValue } =
        createLocalStorage<{ value?: 'yes' | 'no' }>(
            `${uiConfig.baseUriPath}:${localStorageKey}:v1:${id}`,
            {}
        );
    const [selected, setSelected] = useState<'yes' | 'no' | undefined>(
        selectedValue.value
    );
    const { trackEvent } = usePlausibleTracker();

    if (!uiConfig?.flags?.T || Boolean(selected)) {
        return null;
    }

    const onTrackFeedback = (value: 'yes' | 'no') => {
        setSelected(value);
        setSelectedValue({ value });
        trackEvent(eventName, {
            props: {
                eventType: id,
                wasHelpful: value === 'yes',
            },
        });
    };

    return (
        <Paper
            elevation={0}
            sx={{
                background: theme => theme.palette.neutral.light,
                padding: theme => theme.spacing(1.5, 2),
                marginTop: theme => theme.spacing(1.5),
            }}
        >
            Was this information useful to you?
            <StyledBox>
                <Button
                    size="small"
                    variant={selected === 'yes' ? 'contained' : 'outlined'}
                    sx={{ padding: 0 }}
                    onClick={() => onTrackFeedback('yes')}
                    disabled={Boolean(selected)}
                >
                    Yes
                </Button>
                <Button
                    size="small"
                    variant={selected === 'no' ? 'contained' : 'outlined'}
                    sx={{ padding: 0 }}
                    onClick={() => onTrackFeedback('no')}
                    disabled={Boolean(selected)}
                >
                    No
                </Button>
            </StyledBox>
        </Paper>
    );
};
