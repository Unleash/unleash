import {
    Box,
    Button,
    type SelectChangeEvent,
    styled,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import Select from 'component/common/select';
import { allSdks, type SdkName } from '../dialog/sharedTypes.ts';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const TitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
}));

const StyledButton = styled(Button<typeof Link>)({
    fontWeight: 'bold',
    textDecoration: 'none',
});

const SelectWithButton = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const repositoryUrl =
    'https://github.com/Unleash/unleash-sdk-examples/tree/main';

type exampleDirectories =
    | 'Android'
    | '.NET'
    | 'Flutter'
    | 'Go'
    | 'Java'
    | 'JavaScript'
    | 'Node.js'
    | 'PHP'
    | 'Python'
    | 'React'
    | 'Ruby'
    | 'Rust'
    | 'Svelte'
    | 'Swift'
    | 'Vue';

export const SdkExample = () => {
    const { trackEvent } = usePlausibleTracker();

    const sdkOptions = allSdks.map((sdk) => ({
        key: sdk.name,
        label: sdk.name,
    }));
    const [selectedSdk, setSelectedSdk] =
        useLocalStorageState<exampleDirectories>(
            'onboarding-sdk-example',
            sdkOptions[0].key,
        );
    const onChange = (event: SelectChangeEvent) => {
        setSelectedSdk(event.target.value as SdkName);
    };

    const trackClick = () => {
        trackEvent('onboarding', {
            props: {
                eventType: 'sdk-example-opened',
                sdk: selectedSdk,
            },
        });
    };

    return (
        <>
            <TitleContainer>View SDK Example</TitleContainer>
            <Typography>
                Choose your preferred SDK to view an example.
            </Typography>
            <SelectWithButton>
                <Select
                    id='sdk-select'
                    name='sdk'
                    options={sdkOptions}
                    value={selectedSdk}
                    onChange={onChange}
                    style={{
                        width: '60%',
                    }}
                />
                <Box>
                    <StyledButton
                        to={`${repositoryUrl}/${selectedSdk}`}
                        target='_blank'
                        component={Link}
                        variant='text'
                        color='primary'
                        onClick={trackClick}
                    >
                        Go to example
                    </StyledButton>
                </Box>
            </SelectWithButton>
        </>
    );
};
