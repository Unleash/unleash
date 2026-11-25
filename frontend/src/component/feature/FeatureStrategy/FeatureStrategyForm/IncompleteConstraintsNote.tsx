import { Alert, styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import { useUiFlag } from 'hooks/useUiFlag';
import { constraintHasValues } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';

const Banner = styled(Alert)(({ theme }) => ({
    flexGrow: 1,
    alignItems: 'center',
    padding: theme.spacing(0.5, 2),
}));

const noteText = (count: number): string =>
    `${count} constraint${count === 1 ? '' : 's'} without values will be discarded unless you fill ${count === 1 ? 'it' : 'them'} in.`;

export const IncompleteConstraintsNote = ({
    constraints = [],
}: {
    constraints?: IConstraint[];
}) => {
    const singlePageStrategyForm = useUiFlag('singlePageStrategyForm');
    if (!singlePageStrategyForm) return null;

    const incompleteConstraints = constraints.filter(
        (constraint) => !constraintHasValues(constraint),
    );
    if (incompleteConstraints.length === 0) return null;

    return (
        <Banner severity='warning'>
            {noteText(incompleteConstraints.length)}
        </Banner>
    );
};
