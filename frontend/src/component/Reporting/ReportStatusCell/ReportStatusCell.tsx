import { VFC, ReactElement } from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ReportProblemOutlined, Check } from '@mui/icons-material';
import { styled } from '@mui/material';
import { IReportTableRow } from 'component/Reporting/ReportTable/ReportTable';

interface IReportStatusCellProps {
    row: {
        original: IReportTableRow;
    };
}

export const ReportStatusCell: VFC<IReportStatusCellProps> = ({
    row,
}): ReactElement => {
    if (row.original.status === 'potentially-stale') {
        return (
            <TextCell>
                <StyledText>
                    <ReportProblemOutlined />
                    <span>Potentially stale</span>
                </StyledText>
            </TextCell>
        );
    }

    return (
        <TextCell>
            <StyledText>
                <Check />
                <span>Healthy</span>
            </StyledText>
        </TextCell>
    );
};

const StyledText = styled('span')(({ theme }) => ({
    display: 'flex',
    gap: '1ch',
    alignItems: 'center',
    textAlign: 'right',
    '& svg': { color: theme.palette.inactiveIcon },
}));
