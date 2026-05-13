import { Box, styled } from '@mui/material';
import { formatAssetPath } from 'utils/formatPath';
import { allSdks, type Sdk } from '../../sharedTypes.ts';
import { SdkLogo } from './SdkLogo';

const StyledSummary = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

interface ISelectSdkSummaryProps {
    sdk?: Sdk;
}
export const SelectSdkSummary = ({ sdk }: ISelectSdkSummaryProps) => {
    if (!sdk) return null;

    const sdkIcon = allSdks.find((item) => item.name === sdk.name)?.icon;

    return (
        <StyledSummary>
            {sdkIcon && <SdkLogo src={formatAssetPath(sdkIcon)} alt='' />}
            {sdk.name}
        </StyledSummary>
    );
};
