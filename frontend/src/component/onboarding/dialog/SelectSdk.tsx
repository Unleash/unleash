import { Avatar, Box, Link, styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { formatAssetPath } from 'utils/formatPath';
import { SectionHeader, StepperBox } from './SharedComponents.tsx';
import { clientSdks, type Sdk, serverSdks } from './sharedTypes.ts';
import { Stepper } from './Stepper.tsx';
import { Badge } from 'component/common/Badge/Badge';

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
    backgroundColor: theme.palette.background.default,
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

interface ISelectSdkProps {
    onSelect: (sdk: Sdk) => void;
}
export const SelectSdk: FC<ISelectSdkProps> = ({ onSelect }) => {
    return (
        <SpacedContainer>
            <Typography variant='h2'>Connect an SDK to Unleash</Typography>
            <StepperBox>
                <Stepper active={0} steps={3} />
                <Badge color='secondary'>1/3 - Choose SDK</Badge>
            </StepperBox>

            <Box sx={{ mt: 2 }}>
                <SectionHeader>Select SDK</SectionHeader>
                <SecondarySectionHeader>
                    Server side SDKs
                </SecondarySectionHeader>
                <SdkListSection>
                    {serverSdks.map((sdk) => (
                        <SdkTile key={sdk.name}>
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
                        <SdkTile key={sdk.name}>
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
