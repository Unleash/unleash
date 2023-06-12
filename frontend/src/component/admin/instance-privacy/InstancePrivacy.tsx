import {
    Box,
    FormControlLabel,
    styled,
    Switch,
    Typography,
} from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const CardTitleRow = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const CardDescription = styled(Box)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(2),
}));

const SwitchLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const PropertyName = styled('p')(({ theme }) => ({
    display: 'table-cell',
    fontWeight: 'bold',
    paddingTop: theme.spacing(2),
}));

const PropertyDetails = styled('p')(({ theme }) => ({
    display: 'table-cell',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(4),
}));

const DataCollectionExplanation = styled('p')(({ theme }) => ({
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
}));

const NoDataCollectedBadge = styled('span')(({ theme }) => ({
    display: 'flex',
    marginRight: 'auto',
    paddingLeft: theme.spacing(4),
}));

interface IPrivacyProps {
    title: String;
    infoText: String;
    concreteDetails: Record<string, string>;
    enabled: boolean;
    onChange: () => void;
}

export const InstancePrivacy = ({
    title,
    infoText,
    concreteDetails,
    enabled,
    onChange,
}: IPrivacyProps) => {
    return (
        <StyledContainer>
            <CardTitleRow>
                <b>{title}</b>
                <NoDataCollectedBadge>
                    <Badge color="neutral" icon={<TopicOutlinedIcon />}>
                        No data collected
                    </Badge>
                </NoDataCollectedBadge>
                <FormControlLabel
                    sx={{ margin: 0 }}
                    control={
                        <Switch
                            onChange={onChange}
                            value={false}
                            name="enabled"
                            checked={enabled}
                        />
                    }
                    label={
                        <SwitchLabel>
                            {enabled ? 'Enabled' : 'Disabled'}
                        </SwitchLabel>
                    }
                />
            </CardTitleRow>

            <CardDescription>
                <DataCollectionExplanation>
                    {infoText}
                </DataCollectionExplanation>

                <div style={{ display: 'table' }}>
                    {Object.entries(concreteDetails).map(([key, value]) => {
                        return (
                            <div key={key} style={{ display: 'table-row' }}>
                                <PropertyName>{key}</PropertyName>
                                <PropertyDetails>{value}</PropertyDetails>
                            </div>
                        );
                    })}
                </div>
            </CardDescription>
        </StyledContainer>
    );
};
