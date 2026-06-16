import { Box, Button, styled } from '@mui/material';
import { SdkLogo } from './SdkLogo.tsx';
import { formatAssetPath } from 'utils/formatPath';
import {
    clientSdks,
    type Sdk,
    type SdkName,
    type SdkType,
    serverSdks,
} from '../../sharedTypes.ts';

const SpacedContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
}));

export const SectionHeader = styled('div')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
}));

const SecondarySectionHeader = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(2),
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const SdkListSection = styled('div')(({ theme }) => ({
    display: 'flex',
    columnGap: theme.spacing(1.5),
    rowGap: theme.spacing(1.5),
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
}));

const SdkButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
    fontSize: theme.typography.body2.fontSize,
    border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 1.5),
    minWidth: theme.spacing(30),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const SdkTileContent = styled('div')(({ theme }) => ({
    color: theme.palette.text.primary,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
}));

const SelectLabel = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 700,
}));

interface ISdkListProps {
    sdks: { name: SdkName; icon: RawAssetURL }[];
    type: SdkType;
    selectedSdkName: string | undefined;
    onSelect: (sdk: Sdk) => void;
}

const SdkList = ({ sdks, type, selectedSdkName, onSelect }: ISdkListProps) => (
    <SdkListSection>
        {sdks.map((sdk) => {
            const isSelected = selectedSdkName === sdk.name;
            return (
                <SdkButton
                    key={sdk.name}
                    onClick={() => onSelect({ name: sdk.name, type })}
                    variant='text'
                    isSelected={isSelected}
                >
                    <SdkLogo src={formatAssetPath(sdk.icon)} alt='' />
                    <SdkTileContent>
                        <b>{sdk.name}</b>
                        <SelectLabel>
                            {isSelected ? 'Selected' : 'Select'}
                        </SelectLabel>
                    </SdkTileContent>
                </SdkButton>
            );
        })}
    </SdkListSection>
);

interface ISelectSdkProps {
    onSelect: (sdk: Sdk) => void;
    sdk?: Sdk;
}
export const SelectSdk = ({ onSelect, sdk }: ISelectSdkProps) => {
    const selectedSdkName = sdk?.name;
    return (
        <SpacedContainer>
            <Box>
                <SectionHeader>Backend SDKs</SectionHeader>
                <SecondarySectionHeader>
                    Backend SDKs need a backend API key.
                </SecondarySectionHeader>
                <SdkList
                    sdks={serverSdks}
                    type='client'
                    selectedSdkName={selectedSdkName}
                    onSelect={onSelect}
                />
            </Box>
            <Box>
                <SectionHeader>Frontend SDKs</SectionHeader>
                <SecondarySectionHeader>
                    Frontend SDKs need a frontend API key.
                </SecondarySectionHeader>
                <SdkList
                    sdks={clientSdks}
                    type='frontend'
                    selectedSdkName={selectedSdkName}
                    onSelect={onSelect}
                />
            </Box>
        </SpacedContainer>
    );
};
