import { CloudCircle } from '@mui/icons-material';
import { styled } from '@mui/material';
import { IFeatureEnvironment, IFeatureVariant } from 'interfaces/featureToggle';
import { EnvironmentVariantsTable } from './EnvironmentVariantsTable/EnvironmentVariantsTable';

const StyledCard = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.dividerAlternative}`,
    '&:not(:last-child)': {
        marginBottom: theme.spacing(3),
    },
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& > div': {
        display: 'flex',
        alignItems: 'center',
    },
}));

const StyledCloudCircle = styled(CloudCircle, {
    shouldForwardProp: prop => prop !== 'deprecated',
})<{ deprecated?: boolean }>(({ theme, deprecated }) => ({
    color: deprecated
        ? theme.palette.neutral.border
        : theme.palette.primary.main,
}));

const StyledName = styled('span', {
    shouldForwardProp: prop => prop !== 'deprecated',
})<{ deprecated?: boolean }>(({ theme, deprecated }) => ({
    color: deprecated
        ? theme.palette.text.secondary
        : theme.palette.text.primary,
    marginLeft: theme.spacing(1.25),
}));

interface IEnvironmentVariantsCardProps {
    environment: IFeatureEnvironment;
    searchValue: string;
    onAddVariant: () => void;
    onEditVariant: (variant: IFeatureVariant) => void;
    onDeleteVariant: (variant: IFeatureVariant) => void;
    children?: React.ReactNode;
}

export const EnvironmentVariantsCard = ({
    environment,
    searchValue,
    onAddVariant,
    onEditVariant,
    onDeleteVariant,
    children,
}: IEnvironmentVariantsCardProps) => {
    return (
        <StyledCard>
            <StyledHeader>
                <div>
                    <StyledCloudCircle deprecated={environment.deprecated} />
                    <StyledName deprecated={environment.deprecated}>
                        {environment.name}
                    </StyledName>
                </div>
                {children}
            </StyledHeader>
            <EnvironmentVariantsTable
                environment={environment}
                searchValue={searchValue}
                onAddVariant={onAddVariant}
                onEditVariant={onEditVariant}
                onDeleteVariant={onDeleteVariant}
            />
        </StyledCard>
    );
};
