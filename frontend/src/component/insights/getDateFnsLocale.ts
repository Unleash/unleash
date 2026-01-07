import 'chartjs-adapter-date-fns';
import {
    cs,
    de,
    da,
    enGB,
    enIN,
    enUS,
    fr,
    nb,
    ptBR,
    sv,
    ja,
} from 'date-fns/locale';
import type { defaultLocales } from 'constants/defaultLocales';

const dateFnsLocales: { [key in (typeof defaultLocales)[number]]: Locale } = {
    cs: cs,
    'da-DK': da,
    de: de,
    'en-GB': enGB,
    'en-IN': enIN,
    'en-US': enUS,
    'fr-FR': fr,
    ja: ja,
    'nb-NO': nb,
    'pt-BR': ptBR,
    'sv-SE': sv,
};

export const getDateFnsLocale = (locale: string): Locale => {
    return dateFnsLocales[locale] ?? enUS;
};
