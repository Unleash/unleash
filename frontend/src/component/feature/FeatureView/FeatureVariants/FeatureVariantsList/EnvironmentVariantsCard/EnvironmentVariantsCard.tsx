import { CloudCircle } from '@mui/icons-material';
import { styled } from '@mui/material';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
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
    children?: React.ReactNode;
}

export const EnvironmentVariantsCard = ({
    environment,
    children,
}: IEnvironmentVariantsCardProps) => {
    // TODO: Maybe add `deprecated` or `globallyEnabled` to IFeatureEnvironment on the back-end to avoid this
    const { environments } = useEnvironments();

    const deprecated = !Boolean(
        environments.find(env => env.name === environment.name)?.enabled
    );

    return (
        <StyledCard>
            <StyledHeader>
                <div>
                    <StyledCloudCircle deprecated={deprecated} />
                    <StyledName deprecated={deprecated}>
                        {environment.name}
                    </StyledName>
                </div>
                {children}
            </StyledHeader>
            <EnvironmentVariantsTable environment={environment} />
        </StyledCard>
    );
};
