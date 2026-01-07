import { styled } from '@mui/material';
import { ProjectLastSeen } from 'component/project/ProjectCard/ProjectLastSeen/ProjectLastSeen';

const StyledContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'hideLabel',
})<{ hideLabel?: boolean }>(({ theme, hideLabel }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: hideLabel ? 'center' : 'start',
    padding: theme.spacing(1, 2),
}));

type ProjectListTableLastSeenCellProps = {
    value?: Date | number | string | null;
    hideLabel?: boolean;
};

export const ProjectListTableLastSeenCell = ({
    value,
    hideLabel,
}: ProjectListTableLastSeenCellProps) => (
    <StyledContainer hideLabel={hideLabel}>
        <ProjectLastSeen date={value} hideLabel={hideLabel} />
    </StyledContainer>
);
