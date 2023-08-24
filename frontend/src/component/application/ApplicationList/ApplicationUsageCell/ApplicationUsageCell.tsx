import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled, Typography, useTheme } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

export interface IApplicationUsageCellProps {
    usage: IApplicationUsage[];
}

export interface IApplicationUsage {
    project: string;
    environments: string[];
}

const StyledLink = styled(Link)(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

export const ApplicationUsageCell = ({ usage }: IApplicationUsageCellProps) => {
    const theme = useTheme();
    const formattedProjects: (React.JSX.Element | string)[] = [];

    usage.forEach((p, index) => {
        if (index !== 0) {
            formattedProjects.push(', ');
        }
        if (p.project !== '*') {
            formattedProjects.push(
                <StyledLink to={`/projects/${p.project}`}>
                    {p.project}
                </StyledLink>
            );
        } else {
            formattedProjects.push(p.project);
        }
        formattedProjects.push(` (${p.environments.join(', ')})`);
    });
    return (
        <TextCell>
            <ConditionallyRender
                condition={usage.length > 0}
                show={
                    <Typography variant="body2">{formattedProjects}</Typography>
                }
                elseShow={
                    <Typography
                        variant="body2"
                        color={theme.palette.text.secondary}
                    >
                        not connected
                    </Typography>
                }
            />
        </TextCell>
    );
};
