import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import Input from 'component/common/Input/Input';
import { parseDateValue, parseValidDate } from 'component/common/util';
interface IDateSingleValueProps {
    setValue: (value: string) => void;
    value?: string;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

export const DateSingleValue = ({
    setValue,
    value,
    error,
    setError,
}: IDateSingleValueProps) => {
    if (!value) return null;

    return (
        <>
            <ConstraintFormHeader>Select a date</ConstraintFormHeader>
            <Input
                id="date"
                label="Date"
                type="datetime-local"
                value={parseDateValue(value)}
                onChange={e => {
                    setError('');
                    const parsedDate = parseValidDate(e.target.value);
                    const dateString = parsedDate?.toISOString();
                    dateString && setValue(dateString);
                }}
                InputLabelProps={{
                    shrink: true,
                }}
                error={Boolean(error)}
                errorText={error}
                required
            />
        </>
    );
};
