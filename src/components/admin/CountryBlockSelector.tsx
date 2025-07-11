import React, { useMemo } from 'react';
import Select from 'react-select';
import countries from 'i18n-iso-countries';
import ReactCountryFlag from 'react-country-flag';
import frLocale from 'i18n-iso-countries/langs/fr.json';

// Charger les noms de pays en français
countries.registerLocale(frLocale);

// Type pour les options
interface CountryOption {
    value: string; // code ISO2
    label: React.ReactNode;
}

interface CountryBlockSelectorProps {
    value: string[];
    onChange: (codes: string[]) => void;
    placeholder?: string;
}

const CountryBlockSelector: React.FC<CountryBlockSelectorProps> = ({ value, onChange, placeholder }) => {
    // Générer la liste des options (nom + drapeau)
    const options: CountryOption[] = useMemo(() => {
        const countryObj = countries.getNames('fr', { select: 'official' });
        return Object.entries(countryObj).map(([code, name]) => ({
            value: code,
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ReactCountryFlag countryCode={code} svg style={{ width: 20, height: 20 }} />
                    <span>{name}</span>
                </span>
            ),
        }));
    }, []);

    // Trouver les options sélectionnées
    const selectedOptions = options.filter(opt => value.includes(opt.value));

    return (
        <Select
            isMulti
            options={options}
            value={selectedOptions}
            onChange={opts => onChange(Array.isArray(opts) ? opts.map(o => o.value) : [])}
            placeholder={placeholder || 'Sélectionner les pays à bloquer...'}
            classNamePrefix="country-select"
            styles={{
                option: (base) => ({ ...base, display: 'flex', alignItems: 'center', gap: 8 }),
                multiValueLabel: (base) => ({ ...base, display: 'flex', alignItems: 'center', gap: 4 }),
            }}
        />
    );
};

export default CountryBlockSelector; 