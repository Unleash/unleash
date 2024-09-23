import { type SelectChangeEvent, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Select from 'component/common/select';
import { useState } from 'react';
import { allSdks } from '../../../../onboarding/sharedTypes';

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

export const SdkExample = () => {
    const sdkOptions = allSdks.map((sdk) => ({
        key: sdk.name,
        label: sdk.name,
    }));

    const [selectedSdk, setSelectedSdk] = useState<string>(sdkOptions[0].key);

    const onChange = (event: SelectChangeEvent) => {
        setSelectedSdk(event.target.value);
    };
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
            <StyledLink to={``}>Go to example</StyledLink>
        </>
    );
};
