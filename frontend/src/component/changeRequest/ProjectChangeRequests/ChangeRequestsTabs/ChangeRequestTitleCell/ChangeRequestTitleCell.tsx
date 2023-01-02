import { TextCell } from '../../../../common/Table/cells/TextCell/TextCell';
import { Link, styled, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/system';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

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
    const projectId = useRequiredPathParam('projectId');
    const { id, features: changes } = original;
    const theme = useTheme();
    const path = `/projects/${projectId}/change-requests/${id}`;

    if (!value) {
        return <TextCell />;
    }

    return (
        <TextCell sx={{ minWidth: '200px' }}>
            <StyledLink>
                <Typography
                    component={'span'}
                    variant={'body2'}
                    color={theme.palette.text.secondary}
                >
                    <Link
                        component={RouterLink}
                        underline={'hover'}
                        to={path}
                        sx={theme => ({
                            paddingTop: theme.spacing(0.2),
                            marginRight: theme.spacing(1),
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        })}
                    >
                        Change request
                    </Link>
                    {`#${id}`}
                </Typography>
            </StyledLink>
            <span>
                {`${changes?.length}`}{' '}
                {changes.length <= 1 ? `update` : 'updates'}
            </span>
        </TextCell>
    );
};
