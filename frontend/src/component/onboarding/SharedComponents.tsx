import { styled } from '@mui/material';

export type SdkType = 'client' | 'frontend';
export type Sdk = { name: SdkName; type: SdkType };

export const SectionHeader = styled('div')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body1.fontSize,
}));

export type ServerSdkName =
    | 'Node'
    | 'Golang'
    | 'Ruby'
    | 'PHP'
    | 'Rust'
    | 'DotNet'
    | 'Java'
    | 'Python';
export type ClientSdkName =
    | 'Javascript'
    | 'React'
    | 'Vue'
    | 'Svelte'
    | 'Swift'
    | 'Android'
    | 'Flutter';
export type SdkName = ServerSdkName | ClientSdkName;
