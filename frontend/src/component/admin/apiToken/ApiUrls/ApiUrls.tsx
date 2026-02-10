import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    styled,
} from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ApiUrlTableRow } from './ApiUrlTableRow/ApiUrlTableRow';

const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

export const ApiUrls = () => {
    const { uiConfig } = useUiConfig();

    const edgeUrls = uiConfig.edgeUrl
        ? {
              edgeUrl: `${uiConfig.edgeUrl}/api/`,
              edgeFrontendUrl: `${uiConfig.edgeUrl}/api/frontend/`,
          }
        : undefined;

    const clientApiUrl = `${uiConfig.unleashUrl}/api/`;
    const frontendApiUrl = `${uiConfig.unleashUrl}/api/frontend/`;

    return (
        <TableContainer>
            <Table aria-label='API URLs'>
                <TableHead>
                    <TableRow>
                        <StyledTableCellHeader>Type</StyledTableCellHeader>
                        <StyledTableCellHeader>URL</StyledTableCellHeader>
                        <StyledTableCellHeader align='center'>
                            Actions
                        </StyledTableCellHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {edgeUrls && (
                        <>
                            <ApiUrlTableRow
                                title='Edge Backend'
                                url={edgeUrls.edgeUrl}
                            />
                            <ApiUrlTableRow
                                title='Edge Frontend'
                                url={edgeUrls.edgeFrontendUrl}
                            />
                        </>
                    )}
                    <ApiUrlTableRow title='Backend' url={clientApiUrl} />
                    <ApiUrlTableRow title='Frontend' url={frontendApiUrl} />
                </TableBody>
            </Table>
        </TableContainer>
    );
};
