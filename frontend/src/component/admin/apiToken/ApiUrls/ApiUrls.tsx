import {
    Button,
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
import { useState } from 'react';

const StyledTableCellHeader = styled(TableCell)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

type ApiUrlsProps = {
    compact: boolean;
};

export const ApiUrls = ({ compact }: ApiUrlsProps) => {
    const { uiConfig } = useUiConfig();
    const [showAll, setShowAll] = useState(!compact);

    const shouldShowUnleashUrls =
        uiConfig.unleashUrl && (showAll || !uiConfig.edgeUrl);

    const shouldShowLessMoreButton =
        compact && uiConfig.edgeUrl && uiConfig.unleashUrl;

    const edgeUrls = uiConfig.edgeUrl
        ? {
              edgeUrl: `${uiConfig.edgeUrl}/api/`,
              edgeFrontendUrl: `${uiConfig.edgeUrl}/api/frontend/`,
          }
        : undefined;

    const clientApiUrl = `${uiConfig.unleashUrl}/api/`;
    const frontendApiUrl = `${uiConfig.unleashUrl}/api/frontend/`;

    return (
        <TableContainer role='region' aria-live='polite'>
            <Table aria-label='API URLs' id='api-urls-table'>
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
                    {shouldShowUnleashUrls && (
                        <>
                            <ApiUrlTableRow
                                title='Backend'
                                url={clientApiUrl}
                            />
                            <ApiUrlTableRow
                                title='Frontend'
                                url={frontendApiUrl}
                            />
                        </>
                    )}
                </TableBody>
            </Table>
            {shouldShowLessMoreButton && (
                <Button
                    sx={{ mt: 1, marginInline: 1.5 }}
                    variant='text'
                    size='small'
                    aria-expanded={showAll}
                    aria-controls='api-urls-table'
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? 'Show less' : 'Show all'}
                </Button>
            )}
        </TableContainer>
    );
};
