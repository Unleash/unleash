import {
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    styled,
    Typography,
} from '@mui/material';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { IUser } from 'interfaces/user';
import { useEffect, useState } from 'react';

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledHeader = styled(StyledContent)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.tertiaryContrast,
    marginBottom: theme.spacing(3),
}));

const StyledInfo = styled('div')(() => ({
    flexGrow: 1,
}));

const StyledInfoName = styled(Typography)(({ theme }) => ({
    fontSize: theme.spacing(3.75),
}));

const StyledAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(9.5),
    height: theme.spacing(9.5),
    marginRight: theme.spacing(3),
}));

const StyledSectionLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginBottom: theme.spacing(4),
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    marginTop: theme.spacing(1.5),
    width: theme.spacing(30),
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
    backgroundColor: theme.palette.inputLabelBackground,
}));

interface IProfileTabProps {
    user: IUser;
}

export const ProfileTab = ({ user }: IProfileTabProps) => {
    const { locationSettings, setLocationSettings } = useLocationSettings();
    const [currentLocale, setCurrentLocale] = useState<string>();

    const [possibleLocales, setPossibleLocales] = useState([
        'en-US',
        'en-GB',
        'nb-NO',
        'sv-SE',
        'da-DK',
        'en-IN',
        'de',
        'cs',
        'pt-BR',
        'fr-FR',
    ]);

    useEffect(() => {
        const found = possibleLocales.find(locale =>
            locale.toLowerCase().includes(locationSettings.locale.toLowerCase())
        );
        setCurrentLocale(found);
        if (!found) {
            setPossibleLocales(prev => [...prev, locationSettings.locale]);
        }
        /* eslint-disable-next-line*/
    }, [locationSettings]);

    const changeLocale = (e: SelectChangeEvent) => {
        const locale = e.target.value;
        setCurrentLocale(locale);
        setLocationSettings({ locale });
    };

    return (
        <>
            <StyledHeader>
                <StyledAvatar user={user} />
                <StyledInfo>
                    <StyledInfoName>{user.name}</StyledInfoName>
                    <Typography variant="body1">{user.email}</Typography>
                </StyledInfo>
            </StyledHeader>
            <StyledContent>
                <StyledSectionLabel>Settings</StyledSectionLabel>
                <Typography variant="body2">
                    This is the format used across the system for time and date
                </Typography>
                <StyledFormControl variant="outlined" size="small">
                    <StyledInputLabel htmlFor="locale-select">
                        Date/Time formatting
                    </StyledInputLabel>
                    <Select
                        id="locale-select"
                        value={currentLocale || ''}
                        native
                        onChange={changeLocale}
                        MenuProps={{
                            style: {
                                zIndex: 9999,
                            },
                        }}
                    >
                        {possibleLocales.map(locale => {
                            return (
                                <option key={locale} value={locale}>
                                    {locale}
                                </option>
                            );
                        })}
                    </Select>
                </StyledFormControl>
            </StyledContent>
        </>
    );
};
