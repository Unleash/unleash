import { LinkCell } from '../../../common/Table/cells/LinkCell/LinkCell';
import { TextCell } from '../../../common/Table/cells/TextCell/TextCell';
import { Link, styled, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

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

    if (!value) {
        return <TextCell />;
    }

    return (
        <TextCell>
            <StyledLink>
                <Link component={RouterLink} underline={'hover'} to={'#'}>
                    Suggestion
                </Link>
                <span style={{ margin: 'auto 8px' }}>{`#${id}`}</span>
            </StyledLink>
            <StyledLink>
                <Link
                    component={RouterLink}
                    underline={'hover'}
                    to={'#'}
                >{`${changes?.length}`}</Link>
                <span style={{ margin: 'auto 8px' }}>{`changes`}</span>
            </StyledLink>
        </TextCell>
    );
};
