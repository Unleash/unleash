import { Box, styled } from '@mui/material';
import type { ChangeRequestState } from 'component/changeRequest/changeRequest.types';
import type { ChangesThatWouldBeOverwritten } from './strategy-change-diff-calculation.ts';
import { EventDiff } from 'component/events/EventDiff/EventDiff.tsx';

const ChangesToOverwriteContainer = styled(Box)(({ theme }) => ({
    color: theme.palette.warning.dark,
    backgroundColor: theme.palette.warning.light,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const StyledDiff = styled(EventDiff)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    width: 'fit-content',
    borderRadius: theme.shape.borderRadius,
}));

const mapToJsonDiff = (changes: ChangesThatWouldBeOverwritten) => {
    return Object.values(changes).reduce(
        (acc, { property, oldValue, newValue }) => {
            acc.data[property] = newValue;
            acc.preData[property] = oldValue;
            return acc;
        },
        { data: {}, preData: {} },
    );
};

export const OverwriteWarning: React.FC<{
    changeType: 'segment' | 'strategy' | 'environment variant configuration';
    changesThatWouldBeOverwritten: ChangesThatWouldBeOverwritten | null;
    changeRequestState: ChangeRequestState;
}> = ({ changeType, changesThatWouldBeOverwritten, changeRequestState }) => {
    const changeRequestIsClosed = ['Applied', 'Cancelled', 'Rejected'].includes(
        changeRequestState,
    );

    if (!changesThatWouldBeOverwritten || changeRequestIsClosed) {
        return null;
    }

    const { data, preData } = mapToJsonDiff(changesThatWouldBeOverwritten);

    return (
        <ChangesToOverwriteContainer>
            <p>
                <strong>Heads up!</strong> The {changeType} has been updated
                since you made your changes. Applying this change now would
                overwrite the configuration that is currently live.
            </p>
            <details>
                <summary>
                    Configuration that has changed and would be overwritten
                </summary>
                <StyledDiff entry={{ data, preData }} />
            </details>
        </ChangesToOverwriteContainer>
    );
};
