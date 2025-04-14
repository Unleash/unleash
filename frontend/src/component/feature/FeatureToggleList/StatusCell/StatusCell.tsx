import { type FC, useMemo } from 'react';
import type { FeatureSearchResponseSchema } from 'openapi';
import { styled } from '@mui/material';
import { getStatus } from './getStatus';
import DifferenceIcon from '@mui/icons-material/Difference';
import { Link } from 'react-router-dom';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

const Container = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const ChangeRequestIcon = styled(DifferenceIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.spacing(2.5),
    marginLeft: theme.spacing(0.5),
}));

const ChangeRequestTooltip = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    ul: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
    },
}));

export const StatusCell: FC<FeatureSearchResponseSchema> = ({
    lifecycle,
    environments,
    project,
}) => {
    const status = useMemo(
        () => getStatus({ lifecycle, environments }),
        [lifecycle, environments],
    );
    const changeRequestIds = useMemo(
        () => environments.flatMap((env) => env.changeRequestIds),
        [environments],
    );

    return (
        <Container>
            <div>{status}</div>
            {changeRequestIds.length > 0 && (
                <HtmlTooltip
                    arrow
                    title={
                        <ChangeRequestTooltip>
                            <div>Change requests:</div>
                            <ul>
                                {changeRequestIds.map((id) => (
                                    <li key={id}>
                                        <Link
                                            to={`/projects/${project}/change-requests/${id}`}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                        >
                                            {`#${id}`}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </ChangeRequestTooltip>
                    }
                >
                    <ChangeRequestIcon />
                </HtmlTooltip>
            )}
        </Container>
    );
};
