import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Divider, styled } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { IN } from 'constants/operators';
import { useSignalEndpoints } from 'hooks/api/getters/useSignalEndpoints/useSignalEndpoints';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { ProjectActionsFilterItem } from './ProjectActionsFilterItem';
import { ActionsFilterState } from '../../useProjectActionsForm';
import { ProjectActionsFormStep } from '../ProjectActionsFormStep';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { Add } from '@mui/icons-material';
import { ProjectActionsPreviewPayload } from './ProjectActionsPreviewPayload';
import { useSignalEndpointSignals } from 'hooks/api/getters/useSignalEndpointSignals/useSignalEndpointSignals';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: theme.spacing(2, 0),
    marginBottom: theme.spacing(1),
    borderStyle: 'dashed',
}));

const StyledTooltip = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    marginTop: theme.spacing(1),
    gap: theme.spacing(1),
}));

interface IProjectActionsFormStepSourceProps {
    sourceId: number;
    setSourceId: React.Dispatch<React.SetStateAction<number>>;
    filters: ActionsFilterState[];
    setFilters: React.Dispatch<React.SetStateAction<ActionsFilterState[]>>;
}

export const ProjectActionsFormStepSource = ({
    sourceId,
    setSourceId,
    filters,
    setFilters,
}: IProjectActionsFormStepSourceProps) => {
    const { signalEndpoints, loading: signalEndpointsLoading } =
        useSignalEndpoints();
    const { signalEndpointSignals } = useSignalEndpointSignals(sourceId, 1);

    const addFilter = () => {
        const id = uuidv4();
        setFilters((filters) => [
            ...filters,
            {
                id,
                parameter: '',
                operator: IN,
            },
        ]);
    };

    const updateInFilters = (updatedFilter: ActionsFilterState) => {
        setFilters((filters) =>
            filters.map((filter) =>
                filter.id === updatedFilter.id ? updatedFilter : filter,
            ),
        );
    };

    const signalEndpointOptions = useMemo(() => {
        if (signalEndpointsLoading) {
            return [];
        }

        return signalEndpoints.map(({ id, name }) => ({
            label: name,
            key: `${id}`,
        }));
    }, [signalEndpointsLoading, signalEndpoints]);

    const { lastSourcePayload, filterSuggestions } = useMemo(() => {
        const lastSourcePayload = signalEndpointSignals[0]?.payload;
        return {
            lastSourcePayload,
            filterSuggestions: Object.keys(lastSourcePayload || {}),
        };
    }, [signalEndpointSignals]);

    return (
        <ProjectActionsFormStep
            name='When this'
            resourceLink={
                <RouterLink to='/integrations/signals'>
                    Create signal endpoint
                </RouterLink>
            }
        >
            <GeneralSelect
                label='Source'
                options={signalEndpointOptions}
                value={`${sourceId}`}
                onChange={(v) => {
                    setSourceId(parseInt(v));
                }}
            />
            <ConditionallyRender
                condition={Boolean(sourceId)}
                show={
                    <ProjectActionsPreviewPayload payload={lastSourcePayload} />
                }
            />
            <StyledDivider />
            {filters.map((filter, index) => (
                <ProjectActionsFilterItem
                    key={filter.id}
                    index={index}
                    filter={filter}
                    stateChanged={updateInFilters}
                    suggestions={filterSuggestions}
                    onDelete={() =>
                        setFilters((filters) =>
                            filters.filter(({ id }) => id !== filter.id),
                        )
                    }
                />
            ))}
            <StyledButtonContainer>
                <Button
                    startIcon={<Add />}
                    onClick={addFilter}
                    variant='outlined'
                    color='primary'
                >
                    Add filter
                </Button>
                <HelpIcon
                    htmlTooltip
                    tooltip={
                        <StyledTooltip>
                            <p>
                                Filters allow you to add conditions to the
                                execution of the actions based on the source
                                payload.
                            </p>
                            <p>
                                If no filters are defined then the action will
                                always be triggered from the selected source, no
                                matter the payload.
                            </p>
                        </StyledTooltip>
                    }
                />
            </StyledButtonContainer>
        </ProjectActionsFormStep>
    );
};
