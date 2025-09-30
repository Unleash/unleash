import { useMemo, type FC, type PropsWithChildren } from 'react';
import { styled } from '@mui/material';
import { useId } from 'hooks/useId';
import { Truncator } from 'component/common/Truncator/Truncator';
import { useProjectEnvironments } from 'hooks/api/getters/useProjectEnvironments/useProjectEnvironments';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { DefaultStrategySuggestion } from './DefaultStrategySuggestion/DefaultStrategySuggestion.js';

const StyledContainer = styled('div')(({ theme }) => ({
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusLarge,
    pointerEvents: 'auto',
    opacity: 1,
}));

const StyledHeader = styled('div')(({ theme }) => ({
    padding: theme.spacing(3, 8, 2, 2),
    display: 'flex',
    width: '100%',
}));

const StyledHeaderTitle = styled('hgroup')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    flex: 1,
    columnGap: theme.spacing(1),
    paddingLeft: theme.spacing(1),
}));

const StyledHeaderTitleLabel = styled('p')(({ theme }) => ({
    width: '100%',
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledTruncator = styled(Truncator)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
}));

const DEFAULT_STRATEGY: IFeatureStrategy = {
    id: '',
    name: 'flexibleRollout',
    disabled: false,
    constraints: [],
    title: '',
    parameters: {
        rollout: '100',
        stickiness: 'default',
        groupId: '',
    },
};

type EnvironmentMetadata = {
    strategyCount: number;
    releasePlanCount: number;
};

type EmptyEnvironmentSectionProps = {
    projectId: string;
    featureId: string;
    environmentId: string;
    expandable?: boolean;
    environmentMetadata?: EnvironmentMetadata;
};

export const EmptyEnvironmentSection: FC<
    PropsWithChildren<EmptyEnvironmentSectionProps>
> = ({
    projectId,
    featureId,
    environmentId,
    children,
}) => {
    const { environments } = useProjectEnvironments(projectId);
    const defaultStrategy = environments.find(
        (env) => env.name === environmentId,
    )?.defaultStrategy;

    const strategy: Omit<IFeatureStrategy, 'id'> = useMemo(() => {
        const baseDefaultStrategy = {
            ...DEFAULT_STRATEGY,
            ...defaultStrategy,
        };
        return {
            ...baseDefaultStrategy,
            disabled: false,
            constraints: baseDefaultStrategy.constraints ?? [],
            title: baseDefaultStrategy.title ?? '',
            parameters: baseDefaultStrategy.parameters ?? {},
        };
    }, [JSON.stringify(defaultStrategy)]);

    return (
        <StyledContainer>
            <StyledHeader>
                <StyledHeaderTitle>
                    <StyledHeaderTitleLabel>Environment</StyledHeaderTitleLabel>
                    <StyledTruncator component='h2'>
                        {environmentId}
                    </StyledTruncator>
                </StyledHeaderTitle>
                {children}
            </StyledHeader>
            <DefaultStrategySuggestion
                projectId={projectId}
                featureId={featureId}
                environmentId={environmentId}
                strategy={strategy}
            />
        </StyledContainer>
    );
};
