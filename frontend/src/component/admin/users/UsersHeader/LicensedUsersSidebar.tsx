import { Alert, Button, styled, Typography } from '@mui/material';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import type React from 'react';
const ModalContentContainer = styled('section')(({ theme }) => ({
    minHeight: '100vh',
    maxWidth: 700,
    width: '95vw',
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(4),
    paddingInline: theme.spacing(4),
    paddingBlock: theme.spacing(3.75),
}));

const WidgetContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(9),
}));

const HeaderRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const ModalHeader = styled('h3')(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    margin: 0,
    fontWeight: theme.typography.h4.fontWeight,
}));

const RowHeader = styled('h4')(({ theme }) => ({
    margin: 0,
    fontWeight: theme.typography.h4.fontWeight,
    fontSize: theme.spacing(1.75),
}));

const Row = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const CloseRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    marginBlockStart: 'auto',
    gap: theme.spacing(4),
}));

const InfoRow = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    width: '100%',
}));

const LicenceBox = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    flexDirection: 'column',
    width: '100%',
    background: theme.palette.background.elevation1,
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadiusLarge,
}));

type LicensedUsersSidebarProps = {
    open: boolean;
    close: () => void;
};

export const LicensedUsersSidebar = ({
    open,
    close,
}: LicensedUsersSidebarProps) => {
    return (
        <DynamicSidebarModal
            open={open}
            onClose={close}
            label='Project status'
            onClick={(e: React.SyntheticEvent) => {
                if (e.target instanceof HTMLAnchorElement) {
                    close();
                }
            }}
        >
            <ModalContentContainer>
                <HeaderRow>
                    <ModalHeader>Licensed seats</ModalHeader>
                </HeaderRow>
                <WidgetContainer>
                    <Row>
                        <RowHeader>Last 30 days</RowHeader>
                        <InfoRow>
                            <LicenceBox>
                                <Typography fontWeight='bold'>11/25</Typography>
                                <Typography variant='body2'>
                                    Used seats last 30 days
                                </Typography>
                            </LicenceBox>
                            <Alert severity='info'>
                                A licensed seat is a unique user that had access
                                to your Unleash instance within the last 30
                                days, and thereby occupied a seat.
                            </Alert>
                        </InfoRow>
                    </Row>
                    <Row>
                        <RowHeader>Last year</RowHeader>
                        <div>this will be great grid</div>
                    </Row>
                </WidgetContainer>
                <CloseRow>
                    <Button variant='outlined' onClick={close}>
                        Close
                    </Button>
                </CloseRow>
            </ModalContentContainer>
        </DynamicSidebarModal>
    );
};
