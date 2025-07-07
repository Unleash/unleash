import { styled, Typography } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { IActionSet } from 'interfaces/action';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { formatOperatorDescription } from 'utils/formatOperatorDescription';

const StyledItem = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

interface IProjectActionsFiltersCellProps {
    action: IActionSet;
}

export const ProjectActionsFiltersCell = ({
    action,
}: IProjectActionsFiltersCellProps) => {
    const { payload } = action.match;
    const filters = Object.entries(payload);

    if (filters.length === 0) {
        return <TextCell>0 filters</TextCell>;
    }

    return (
        <TextCell>
            <TooltipLink
                tooltipProps={{
                    maxWidth: 500,
                }}
                tooltip={
                    <>
                        {filters.map(
                            ([
                                parameter,
                                {
                                    inverted,
                                    operator,
                                    caseInsensitive,
                                    value,
                                    values,
                                },
                            ]) => {
                                const operatorDescription: string =
                                    formatOperatorDescription(operator);

                                const operatorText = inverted ? (
                                    <>
                                        is <u>not</u>{' '}
                                        {operatorDescription.substring(2)}
                                    </>
                                ) : (
                                    operatorDescription
                                );

                                return (
                                    <StyledItem key={parameter}>
                                        <strong>{parameter}</strong>{' '}
                                        {operatorText}
                                        {caseInsensitive
                                            ? ' (case insensitive)'
                                            : ''}
                                        {': '}
                                        <strong>
                                            {values ? values.join(', ') : value}
                                        </strong>
                                    </StyledItem>
                                );
                            },
                        )}
                    </>
                }
            >
                {filters.length === 1
                    ? '1 filter'
                    : `${filters.length} filters`}
            </TooltipLink>
        </TextCell>
    );
};
