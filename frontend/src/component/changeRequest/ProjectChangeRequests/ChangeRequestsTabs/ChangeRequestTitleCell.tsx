import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { Link, styled, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { Truncator } from 'component/common/Truncator/Truncator';

interface IChangeRequestTitleCellProps {
    value?: any;
    row: { original: any };
}

export const StyledLink = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    margin: 0,
}));

export const ChangeRequestTitleCell = ({
    value,
    row: { original },
}: IChangeRequestTitleCellProps) => {
    const { searchQuery } = useSearchHighlightContext();
    const projectId = useRequiredPathParam('projectId');
    const {
        id,
        title,
        features: featureChanges,
        segments: segmentChanges,
    } = original;
    const totalChanges =
        (featureChanges || []).length + (segmentChanges || []).length;
    const path = `/projects/${projectId}/change-requests/${id}`;

    if (!value) {
        return <TextCell />;
    }

    return (
        <TextCell sx={{ minWidth: '200px' }}>
            <StyledLink>
                <Typography variant={'body2'}>
                    <Link
                        component={RouterLink}
                        underline={'hover'}
                        to={path}
                        sx={(theme) => ({
                            paddingTop: theme.spacing(0.2),
                            marginRight: theme.spacing(1),
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        })}
                    >
                        <Truncator title={title}>
                            <Highlighter search={searchQuery}>
                                {title}
                            </Highlighter>
                        </Truncator>
                    </Link>
                </Typography>
            </StyledLink>
            <span>
                {`${totalChanges}`} {totalChanges <= 1 ? `update` : 'updates'}
            </span>
        </TextCell>
    );
};
