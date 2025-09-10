import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Link, styled, Typography } from '@mui/material';
import { Link as RouterLink, type LinkProps } from 'react-router-dom';

type IGlobalChangeRequestTitleCellProps = {
    value?: any;
    row: { original: any };
};

const LinkContainer = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const BaseLink = styled(({ children, ...props }: LinkProps) => (
    <Link component={RouterLink} {...props}>
        {children}
    </Link>
))(({ theme }) => ({
    textDecoration: 'none',
    color: 'inherit',
    ':hover': {
        textDecoration: 'underline',
    },
}));

const ChangeRequestLink = styled(BaseLink)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 'bold',
}));

const UpdateText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

export const GlobalChangeRequestTitleCell = ({
    value,
    row: { original },
}: IGlobalChangeRequestTitleCellProps) => {
    const {
        id,
        title,
        project,
        projectName,
        features: featureChanges,
        segments: segmentChanges,
    } = original;
    const totalChanges =
        (featureChanges || []).length + (segmentChanges || []).length;
    const projectPath = `/projects/${project}`;
    const crPath = `${projectPath}/change-requests/${id}`;

    if (!value) {
        return <TextCell />;
    }

    return (
        <TextCell sx={{ minWidth: '300px' }}>
            <LinkContainer>
                <BaseLink to={projectPath}>{projectName}</BaseLink>
                <span aria-hidden='true'> / </span>
                <ChangeRequestLink to={crPath}>{title}</ChangeRequestLink>
            </LinkContainer>
            <UpdateText>
                {`${totalChanges}`} {totalChanges === 1 ? `update` : 'updates'}
            </UpdateText>
        </TextCell>
    );
};
