import { FormControlLabel, Switch } from '@material-ui/core';
import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';

interface ICaseInsensitiveProps {
    caseInsensitive: boolean;
    setCaseInsensitive: (caseInsensitive: boolean) => void;
}

export const CaseInsensitive = ({
    caseInsensitive,
    setCaseInsensitive,
}: ICaseInsensitiveProps) => {
    return (
        <>
            <ConstraintFormHeader>
                Should the constraint be case insensitive?
            </ConstraintFormHeader>
            <FormControlLabel
                style={{ display: 'block' }}
                control={
                    <Switch
                        checked={caseInsensitive}
                        onChange={() => setCaseInsensitive(!caseInsensitive)}
                        color="primary"
                    />
                }
                label="Case insensitive"
            />
        </>
    );
};
