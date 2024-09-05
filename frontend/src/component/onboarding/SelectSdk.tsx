import { Avatar, Box, Link, styled, Typography } from '@mui/material';
import type { FC } from 'react';
import android from 'assets/icons/sdks/Logo-android.svg';
import dotnet from 'assets/icons/sdks/Logo-net.svg';
import flutter from 'assets/icons/sdks/Logo-flutter.svg';
import go from 'assets/icons/sdks/Logo-go.svg';
import swift from 'assets/icons/sdks/Logo-swift.svg';
import java from 'assets/icons/sdks/Logo-java.svg';
import javascript from 'assets/icons/sdks/Logo-javascript.svg';
import node from 'assets/icons/sdks/Logo-node.svg';
import php from 'assets/icons/sdks/Logo-php.svg';
import python from 'assets/icons/sdks/Logo-python.svg';
import react from 'assets/icons/sdks/Logo-react.svg';
import ruby from 'assets/icons/sdks/Logo-ruby.svg';
import rust from 'assets/icons/sdks/Logo-rust.svg';
import svelte from 'assets/icons/sdks/Logo-svelte.svg';
import vue from 'assets/icons/sdks/Logo-vue.svg';
import { formatAssetPath } from 'utils/formatPath';
import { SectionHeader } from './SharedComponents';
import type { ClientSdkName, Sdk, ServerSdkName } from './sharedTypes';

const SpacedContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(5, 8, 8, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const SecondarySectionHeader = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    fontSize: theme.typography.body1.fontSize,
}));

const SdkListSection = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(6),
    display: 'flex',
    columnGap: theme.spacing(2),
    rowGap: theme.spacing(5),
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
}));

const SdkTile = styled('div')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2, 3),
    width: '170px',
    position: 'relative',
}));

const SdkTileContent = styled('div')(() => ({
    display: 'flex',
    justifyContent: 'space-between',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    position: 'absolute',
    width: theme.spacing(4),
    height: theme.spacing(4),
    top: theme.spacing(-2.75),
    left: theme.spacing(2),
    boxShadow: theme.shadows[2],
}));

export const serverSdks: { name: ServerSdkName; icon: string }[] = [
    { name: 'Node', icon: node },
    { name: 'Golang', icon: go },
    { name: 'Ruby', icon: ruby },
    { name: 'PHP', icon: php },
    { name: 'Rust', icon: rust },
    { name: 'DotNet', icon: dotnet },
    { name: 'Java', icon: java },
    { name: 'Python', icon: python },
];

export const clientSdks: { name: ClientSdkName; icon: string }[] = [
    { name: 'Javascript', icon: javascript },
    { name: 'React', icon: react },
    { name: 'Vue', icon: vue },
    { name: 'Svelte', icon: svelte },
    { name: 'Swift', icon: swift },
    { name: 'Android', icon: android },
    { name: 'Flutter', icon: flutter },
];

interface ISelectSdkProps {
    onSelect: (sdk: Sdk) => void;
}
export const SelectSdk: FC<ISelectSdkProps> = ({ onSelect }) => {
    return (
        <SpacedContainer>
            <Typography variant='h2'>Connect an SDK to Unleash</Typography>
            <Box sx={{ mt: 4 }}>
                <SectionHeader>Select SDK</SectionHeader>
                <SecondarySectionHeader>
                    Server side SDKs
                </SecondarySectionHeader>
                <SdkListSection>
                    {serverSdks.map((sdk) => (
                        <SdkTile>
                            <StyledAvatar src={formatAssetPath(sdk.icon)} />
                            <SdkTileContent>
                                <b>{sdk.name}</b>{' '}
                                <Link
                                    onClick={() =>
                                        onSelect({
                                            name: sdk.name,
                                            type: 'client',
                                        })
                                    }
                                    component='button'
                                >
                                    Select
                                </Link>
                            </SdkTileContent>
                        </SdkTile>
                    ))}
                </SdkListSection>
                <SecondarySectionHeader>
                    Client side SDKs
                </SecondarySectionHeader>
                <SdkListSection>
                    {clientSdks.map((sdk) => (
                        <SdkTile>
                            <StyledAvatar src={formatAssetPath(sdk.icon)} />
                            <SdkTileContent>
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
                            </SdkTileContent>
                        </SdkTile>
                    ))}
                </SdkListSection>
            </Box>
        </SpacedContainer>
    );
};
