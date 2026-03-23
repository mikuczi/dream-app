import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import './PhoneInput.css'

export interface Country {
  name: string
  code: string
  dial: string
  flag: string
}

export const COUNTRIES: Country[] = [
  { name: 'United States',     code: 'US', dial: '+1',    flag: '🇺🇸' },
  { name: 'Canada',            code: 'CA', dial: '+1',    flag: '🇨🇦' },
  { name: 'United Kingdom',    code: 'GB', dial: '+44',   flag: '🇬🇧' },
  { name: 'Germany',           code: 'DE', dial: '+49',   flag: '🇩🇪' },
  { name: 'France',            code: 'FR', dial: '+33',   flag: '🇫🇷' },
  { name: 'Italy',             code: 'IT', dial: '+39',   flag: '🇮🇹' },
  { name: 'Spain',             code: 'ES', dial: '+34',   flag: '🇪🇸' },
  { name: 'Portugal',          code: 'PT', dial: '+351',  flag: '🇵🇹' },
  { name: 'Netherlands',       code: 'NL', dial: '+31',   flag: '🇳🇱' },
  { name: 'Belgium',           code: 'BE', dial: '+32',   flag: '🇧🇪' },
  { name: 'Switzerland',       code: 'CH', dial: '+41',   flag: '🇨🇭' },
  { name: 'Austria',           code: 'AT', dial: '+43',   flag: '🇦🇹' },
  { name: 'Sweden',            code: 'SE', dial: '+46',   flag: '🇸🇪' },
  { name: 'Norway',            code: 'NO', dial: '+47',   flag: '🇳🇴' },
  { name: 'Denmark',           code: 'DK', dial: '+45',   flag: '🇩🇰' },
  { name: 'Finland',           code: 'FI', dial: '+358',  flag: '🇫🇮' },
  { name: 'Poland',            code: 'PL', dial: '+48',   flag: '🇵🇱' },
  { name: 'Czech Republic',    code: 'CZ', dial: '+420',  flag: '🇨🇿' },
  { name: 'Romania',           code: 'RO', dial: '+40',   flag: '🇷🇴' },
  { name: 'Hungary',           code: 'HU', dial: '+36',   flag: '🇭🇺' },
  { name: 'Greece',            code: 'GR', dial: '+30',   flag: '🇬🇷' },
  { name: 'Turkey',            code: 'TR', dial: '+90',   flag: '🇹🇷' },
  { name: 'Russia',            code: 'RU', dial: '+7',    flag: '🇷🇺' },
  { name: 'Ukraine',           code: 'UA', dial: '+380',  flag: '🇺🇦' },
  { name: 'Brazil',            code: 'BR', dial: '+55',   flag: '🇧🇷' },
  { name: 'Mexico',            code: 'MX', dial: '+52',   flag: '🇲🇽' },
  { name: 'Argentina',         code: 'AR', dial: '+54',   flag: '🇦🇷' },
  { name: 'Colombia',          code: 'CO', dial: '+57',   flag: '🇨🇴' },
  { name: 'Chile',             code: 'CL', dial: '+56',   flag: '🇨🇱' },
  { name: 'Peru',              code: 'PE', dial: '+51',   flag: '🇵🇪' },
  { name: 'Venezuela',         code: 'VE', dial: '+58',   flag: '🇻🇪' },
  { name: 'Australia',         code: 'AU', dial: '+61',   flag: '🇦🇺' },
  { name: 'New Zealand',       code: 'NZ', dial: '+64',   flag: '🇳🇿' },
  { name: 'Japan',             code: 'JP', dial: '+81',   flag: '🇯🇵' },
  { name: 'South Korea',       code: 'KR', dial: '+82',   flag: '🇰🇷' },
  { name: 'China',             code: 'CN', dial: '+86',   flag: '🇨🇳' },
  { name: 'India',             code: 'IN', dial: '+91',   flag: '🇮🇳' },
  { name: 'Pakistan',          code: 'PK', dial: '+92',   flag: '🇵🇰' },
  { name: 'Bangladesh',        code: 'BD', dial: '+880',  flag: '🇧🇩' },
  { name: 'Indonesia',         code: 'ID', dial: '+62',   flag: '🇮🇩' },
  { name: 'Malaysia',          code: 'MY', dial: '+60',   flag: '🇲🇾' },
  { name: 'Singapore',         code: 'SG', dial: '+65',   flag: '🇸🇬' },
  { name: 'Thailand',          code: 'TH', dial: '+66',   flag: '🇹🇭' },
  { name: 'Vietnam',           code: 'VN', dial: '+84',   flag: '🇻🇳' },
  { name: 'Philippines',       code: 'PH', dial: '+63',   flag: '🇵🇭' },
  { name: 'Taiwan',            code: 'TW', dial: '+886',  flag: '🇹🇼' },
  { name: 'Hong Kong',         code: 'HK', dial: '+852',  flag: '🇭🇰' },
  { name: 'South Africa',      code: 'ZA', dial: '+27',   flag: '🇿🇦' },
  { name: 'Nigeria',           code: 'NG', dial: '+234',  flag: '🇳🇬' },
  { name: 'Egypt',             code: 'EG', dial: '+20',   flag: '🇪🇬' },
  { name: 'Kenya',             code: 'KE', dial: '+254',  flag: '🇰🇪' },
  { name: 'Morocco',           code: 'MA', dial: '+212',  flag: '🇲🇦' },
  { name: 'Israel',            code: 'IL', dial: '+972',  flag: '🇮🇱' },
  { name: 'UAE',               code: 'AE', dial: '+971',  flag: '🇦🇪' },
  { name: 'Saudi Arabia',      code: 'SA', dial: '+966',  flag: '🇸🇦' },
  { name: 'Iraq',              code: 'IQ', dial: '+964',  flag: '🇮🇶' },
  { name: 'Iran',              code: 'IR', dial: '+98',   flag: '🇮🇷' },
  { name: 'Kuwait',            code: 'KW', dial: '+965',  flag: '🇰🇼' },
]

interface PhoneInputProps {
  value: string
  dialCode: string
  onChange: (phone: string, dialCode: string, countryCode: string) => void
}

export function PhoneInput({ value, dialCode, onChange }: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = COUNTRIES.find(c => c.dial === dialCode) ?? COUNTRIES[0]

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q)
    )
  }, [search])

  function pick(country: Country) {
    onChange(value, country.dial, country.code)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="phone-input-wrap">
      <div className="phone-input-row">
        <button className="phone-country-btn" onClick={() => setOpen(true)} type="button">
          <span className="phone-flag">{selected.flag}</span>
          <span className="phone-dial">{selected.dial}</span>
          <span className="phone-chevron">▾</span>
        </button>
        <input
          className="phone-number-input"
          type="tel"
          inputMode="tel"
          placeholder="Phone number"
          value={value}
          onChange={e => onChange(e.target.value, dialCode, selected.code)}
        />
      </div>

      {open && createPortal(
        <div className="phone-picker-overlay" onClick={() => setOpen(false)}>
          <div className="phone-picker-sheet" onClick={e => e.stopPropagation()}>
            <div className="phone-picker-header">
              <span className="phone-picker-title">Select country</span>
              <button className="phone-picker-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="phone-picker-search-wrap">
              <input
                className="phone-picker-search"
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="phone-picker-list">
              {filtered.map(c => (
                <button
                  key={c.code}
                  className={`phone-picker-row ${c.dial === dialCode ? 'selected' : ''}`}
                  onClick={() => pick(c)}
                >
                  <span className="phone-picker-flag">{c.flag}</span>
                  <span className="phone-picker-name">{c.name}</span>
                  <span className="phone-picker-dial">{c.dial}</span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
