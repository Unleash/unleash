import { Box, Link, styled, Typography } from '@mui/material';
import type { FC } from 'react';

const SpacedContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(5, 8, 8, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const PrimarySectionHeader = styled('div')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
    fontSize: theme.fontSizes.bodySize,
}));

const SecondarySectionHeader = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    fontSize: theme.fontSizes.bodySize,
}));

const SdkListSection = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3, 6),
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
}));

const SdkTile = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    width: '170px',
}));

const serverSdks = [
    { name: 'Node' },
    { name: 'Golang' },
    { name: 'Ruby' },
    { name: 'PHP' },
    { name: 'Rust' },
    { name: 'DotNet' },
    { name: 'Java' },
    { name: 'Python' },
];

const clientSdks = [
    { name: 'Javascript' },
    { name: 'React' },
    { name: 'Vue' },
    { name: 'Svelte' },
    { name: 'Swift' },
    { name: 'Android' },
    { name: 'Flutter' },
];

type SdkType = 'client' | 'frontend';
export type Sdk = { name: string; type: SdkType };
interface ISelectSdkProps {
    onSelect: (sdk: Sdk) => void;
}
export const SelectSdk: FC<ISelectSdkProps> = ({ onSelect }) => {
    return (
        <SpacedContainer>
            <Typography variant='h2'>Connect an SDK to Unleash</Typography>
            <Box sx={{ mt: 4 }}>
                <PrimarySectionHeader>Select SDK</PrimarySectionHeader>
                <SecondarySectionHeader>
                    Server side SDKs
                </SecondarySectionHeader>
                <SdkListSection>
                    {serverSdks.map((sdk) => (
                        <SdkTile>
                            <b>{sdk.name}</b>{' '}
                            <Link
                                onClick={() =>
                                    onSelect({ name: sdk.name, type: 'client' })
                                }
                                component='button'
                            >
                                Select
                            </Link>
                        </SdkTile>
                    ))}
                </SdkListSection>
                <SecondarySectionHeader>
                    Client side SDKs
                </SecondarySectionHeader>
                <SdkListSection>
                    {clientSdks.map((sdk) => (
                        <SdkTile>
                            <b>{sdk.name}</b>{' '}
                            <Link
                                onClick={() =>
                                    onSelect({
                                        name: sdk.name,
                                        type: 'frontend',
                                    })
                                }
                                component='button'
                            >
                                Select
                            </Link>
                        </SdkTile>
                    ))}
                </SdkListSection>
            </Box>
        </SpacedContainer>
    );
};

export const SelectSdkConcepts = () => {};
