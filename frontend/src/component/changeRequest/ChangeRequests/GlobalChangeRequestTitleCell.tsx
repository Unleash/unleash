import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Link, styled, Typography } from '@mui/material';
import { Link as RouterLink, type LinkProps } from 'react-router-dom';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { Truncator } from 'component/common/Truncator/Truncator';
import type { ChangeRequestSearchItemSchema } from 'openapi';
import type { Row } from '@tanstack/react-table';

const LinkContainer = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    display: 'flex',
    columnGap: theme.spacing(0.5),
}));

const BaseLink = styled(({ children, ...props }: LinkProps) => (
    <Link component={RouterLink} {...props}>
        {children}
    </Link>
))({
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    color: 'inherit',
    ':hover': {
        textDecoration: 'underline',
    },
});

const ChangeRequestLink = styled(BaseLink)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 'bold',
}));

const UpdateText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

type GlobalChangeRequestTitleCellProps = {
    row: Row<ChangeRequestSearchItemSchema>;
};

export const GlobalChangeRequestTitleCell = ({
    row: {
        original: {
            id,
            title,
            project,
            features: featureChanges,
            segments: segmentChanges,
        },
    },
}: GlobalChangeRequestTitleCellProps) => {
    const projectName = useProjectOverviewNameOrId(project);
    const totalChanges =
        featureChanges?.length ?? 0 + segmentChanges?.length ?? 0;
    const projectPath = `/projects/${project}`;
    const crPath = `${projectPath}/change-requests/${id}`;

    return (
        <TextCell>
            <LinkContainer>
                <Truncator title={projectName}>
                    <BaseLink to={projectPath}>{projectName}</BaseLink>
                </Truncator>
                <span aria-hidden='true'>/</span>
                {title ? (
                    <Truncator title={title}>
                        <ChangeRequestLink to={crPath}>
                            {title}
                        </ChangeRequestLink>
                    </Truncator>
                ) : (
                    <ChangeRequestLink to={crPath}>#{id}</ChangeRequestLink>
                )}
            </LinkContainer>
            <UpdateText>
                {`${totalChanges}`} {totalChanges === 1 ? `update` : 'updates'}
            </UpdateText>
        </TextCell>
    );
};
