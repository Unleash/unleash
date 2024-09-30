import { type SelectChangeEvent, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import Select from 'component/common/select';
import { allSdks, type SdkName } from '../dialog/sharedTypes';

const TitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
}));

const StyledLink = styled(Link)({
    fontWeight: 'bold',
    textDecoration: 'none',
});

const repositoryUrl =
    'https://github.com/Unleash/unleash-sdk-examples/tree/main';
const exampleDirectories: Record<SdkName, string> = {
    Android: 'Android',
    '.NET': 'Csharp',
    Flutter: 'Flutter',
    Go: 'Go',
    Java: 'Java',
    JavaScript: 'JavaScript',
    'Node.js': 'NodeJS',
    PHP: 'PHP',
    Python: 'Python',
    React: 'React',
    Ruby: 'Ruby',
    Rust: 'Rust',
    Svelte: 'Svelte',
    Swift: 'Swift',
    Vue: 'Vue',
};

export const SdkExample = () => {
    const sdkOptions = allSdks.map((sdk) => ({
        key: sdk.name,
        label: sdk.name,
    }));

    const [selectedSdk, setSelectedSdk] = useLocalStorageState<SdkName>(
        'onboarding-sdk-example',
        sdkOptions[0].key,
    );

    const onChange = (event: SelectChangeEvent) => {
        setSelectedSdk(event.target.value as SdkName);
    };
    const selectedExample = exampleDirectories[selectedSdk];

    return (
        <>
            <TitleContainer>View SDK Example</TitleContainer>
            <Typography>
                Choose your preferred SDK to view an example
            </Typography>
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
            <StyledLink
                to={`${repositoryUrl}/${selectedExample}`}
                target='_blank'
            >
                Go to example
            </StyledLink>
        </>
    );
};
