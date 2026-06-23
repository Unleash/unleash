import type { ProjectSchema } from 'openapi';
import type { IEnvironment } from 'interfaces/environments';
import {
    Box,
    Checkbox,
    ListItemText,
    MenuItem,
    Select,
    Typography,
    styled,
} from '@mui/material';
import { useState } from 'react';
import { ProjectMenuItem } from './ProjectMenuItem';
import { ProjectAccess } from './ProjectAccess';

const StyledSelectorCardsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
    },
}));

const StyledSelectorCard = styled('div')(({ theme }) => ({
    flex: 1,
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const StyledSelectorCardText = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    flex: 1,
});

export const ProjectAccessSection = ({
    id,
    projects,
    environments,
    searchValue,
}: {
    id: string;
    projects: ProjectSchema[];
    environments: IEnvironment[];
    searchValue: string;
}) => {
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
        [],
    );

    const visibleProjects = projects.filter((p) =>
        selectedProjectIds.includes(p.id),
    );

    const projectSelectorLabel =
        selectedProjectIds.length === 0
            ? 'Select projects'
            : selectedProjectIds.length === 1
              ? (projects.find((p) => p.id === selectedProjectIds[0])?.name ??
                '1 selected')
              : `${selectedProjectIds.length} selected`;

    const environmentSelectorLabel =
        selectedEnvironments.length === 0
            ? 'All environments'
            : selectedEnvironments.length === 1
              ? selectedEnvironments[0]
              : `${selectedEnvironments.length} selected`;

    return (
        <Box>
            <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                Project access ({projects.length})
            </Typography>
            <StyledSelectorCardsContainer>
                <StyledSelectorCard>
                    <StyledSelectorCardText>
                        <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            Select projects to see permissions
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            Choose the projects you want to look closer at
                        </Typography>
                    </StyledSelectorCardText>
                    <Select
                        multiple
                        value={selectedProjectIds}
                        onChange={(e) =>
                            setSelectedProjectIds(e.target.value as string[])
                        }
                        renderValue={() => projectSelectorLabel}
                        size='large'
                        sx={{ minWidth: 150, maxWidth: 200, flexShrink: 0 }}
                        displayEmpty
                        MenuProps={{
                            sx: { '& .MuiPaper-root': { maxWidth: 200 } },
                        }}
                    >
                        {projects.map((project) => (
                            <ProjectMenuItem
                                key={project.id}
                                id={id}
                                project={project}
                                value={project.id}
                                selected={selectedProjectIds.includes(
                                    project.id,
                                )}
                            />
                        ))}
                    </Select>
                </StyledSelectorCard>
                <StyledSelectorCard>
                    <StyledSelectorCardText>
                        <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            Select environments to see what is allowed
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            {environments.length} environment
                            {environments.length !== 1 ? 's' : ''} available
                        </Typography>
                    </StyledSelectorCardText>
                    <Select
                        multiple
                        value={selectedEnvironments}
                        onChange={(e) => {
                            const value = e.target.value as string[];
                            if (value.length <= 3) {
                                setSelectedEnvironments(value);
                            }
                        }}
                        renderValue={() => environmentSelectorLabel}
                        size='large'
                        sx={{ minWidth: 150, maxWidth: 200, flexShrink: 0 }}
                        displayEmpty
                        MenuProps={{
                            sx: { '& .MuiPaper-root': { maxWidth: 200 } },
                        }}
                    >
                        {environments.map((env) => {
                            const isSelected = selectedEnvironments.includes(
                                env.name,
                            );
                            const atLimit = selectedEnvironments.length >= 3;
                            return (
                                <MenuItem
                                    key={env.name}
                                    value={env.name}
                                    disabled={atLimit && !isSelected}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        size='small'
                                    />
                                    <ListItemText
                                        primary={env.name}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            },
                                        }}
                                    />
                                </MenuItem>
                            );
                        })}
                    </Select>
                </StyledSelectorCard>
            </StyledSelectorCardsContainer>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {visibleProjects.map((project) => (
                    <ProjectAccess
                        key={project.id}
                        project={project.id}
                        projectName={project.name}
                        id={id}
                        searchValue={searchValue}
                        environments={selectedEnvironments}
                    />
                ))}
            </Box>
        </Box>
    );
};
