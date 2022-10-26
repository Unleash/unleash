import { TextCell } from '../../../../common/Table/cells/TextCell/TextCell';
import { Link, styled, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/system';

interface IChangesetTitleCellProps {
    value?: any;
    row: { original: any };
}

export const StyledLink = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    margin: 0,
}));

export const ChangesetTitleCell = ({
    value,
    row: { original },
}: IChangesetTitleCellProps) => {
    const { id, changes } = original;
    const theme = useTheme();

    if (!value) {
        return <TextCell />;
    }

    return (
        <TextCell>
            <StyledLink>
                <Link
                    component={RouterLink}
                    underline={'hover'}
                    to={'#'}
                    sx={{ pt: 0.2 }}
                >
                    Suggestion
                </Link>
                <Typography
                    component={'span'}
                    color={theme.palette.text.secondary}
                    sx={{ margin: theme.spacing(0, 1), pt: 0 }}
                >
                    {`#${id}`}
                </Typography>
            </StyledLink>
            <StyledLink>
                <Link
                    component={RouterLink}
                    underline={'hover'}
                    to={'#'}
                >{`${changes?.length}`}</Link>
                <span style={{ margin: 'auto 8px' }}>
                    {changes.length < 1 ? `update` : 'updates'}
                </span>
            </StyledLink>
        </TextCell>
    );
};
