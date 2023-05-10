import { CloudCircle } from '@mui/icons-material';
import { styled, Link } from '@mui/material';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { EnvironmentVariantsTable } from './EnvironmentVariantsTable/EnvironmentVariantsTable';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';

const StyledCard = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        marginBottom: theme.spacing(3),
    },
}));

const StyledHeader = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& > div': {
        display: 'flex',
        alignItems: 'center',
    },
});

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
    fontWeight: theme.fontWeight.bold,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
}));

const StyledTableContainer = styled('div')(({ theme }) => ({
    margin: theme.spacing(3, 0),
}));

const StyledStickinessContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
}));

interface IEnvironmentVariantsCardProps {
    environment: IFeatureEnvironment;
    searchValue: string;
    children?: React.ReactNode;
}

export const EnvironmentVariantsCard = ({
    environment,
    searchValue,
    children,
}: IEnvironmentVariantsCardProps) => {
    const variants = environment.variants ?? [];
    const stickiness = variants[0]?.stickiness || 'default';

    return (
        <StyledCard>
            <StyledHeader>
                <div>
                    <StyledCloudCircle deprecated={!environment.enabled} />
                    <StyledName deprecated={!environment.enabled}>
                        {environment.name}
                    </StyledName>
                </div>
                {children}
            </StyledHeader>
            <ConditionallyRender
                condition={variants.length > 0}
                show={
                    <>
                        <StyledTableContainer>
                            <EnvironmentVariantsTable
                                variants={variants}
                                searchValue={searchValue}
                            />
                        </StyledTableContainer>
                        <ConditionallyRender
                            condition={variants.length > 1}
                            show={
                                <>
                                    <StyledStickinessContainer>
                                        <p>Stickiness:</p>
                                        <Badge>{stickiness}</Badge>
                                    </StyledStickinessContainer>
                                    <StyledDescription>
                                        By overriding the stickiness you can
                                        control which parameter is used to
                                        ensure consistent traffic allocation
                                        across variants.{' '}
                                        <Link
                                            href="https://docs.getunleash.io/reference/feature-toggle-variants"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Read more
                                        </Link>
                                    </StyledDescription>
                                </>
                            }
                        />
                    </>
                }
            />
        </StyledCard>
    );
};
