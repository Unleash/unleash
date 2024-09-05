import { type SelectChangeEvent, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Select from 'component/common/select';
import { useState } from 'react';
import { clientSdks, serverSdks } from '../../../../onboarding/SelectSdk';

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    flexBasis: '30%',
    borderRadius: theme.shape.borderRadiusLarge,
}));

const TitleBox = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 7, 2, 7),
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    minHeight: '80px',
    alignItems: 'center',
    display: 'flex',
}));

const ContentBox = styled('div')(({ theme }) => ({
    padding: theme.spacing(3, 2, 6, 8),
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
}));

const StyledLink = styled(Link)({
    fontWeight: 'bold',
    textDecoration: 'none',
});

export const SdkExample = () => {
    const allSdks = [...serverSdks, ...clientSdks];

    const sdkOptions = allSdks.map((sdk) => ({
        key: sdk.name,
        label: sdk.name,
    }));

    const [selectedSdk, setSelectedSdk] = useState<string>(sdkOptions[0].key);

    const onChange = (event: SelectChangeEvent) => {
        setSelectedSdk(event.target.value);
    };
    return (
        <Container>
            <TitleBox>
                <Typography fontWeight='bold'>View SDK Example</Typography>
            </TitleBox>

            <ContentBox>
                <Typography>
                    See an example implementation of your preferred SDK.
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
            </ContentBox>
        </Container>
    );
};
