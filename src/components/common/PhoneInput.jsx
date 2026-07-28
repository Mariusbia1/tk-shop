import InternationalPhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export default function PhoneInput({ value = '', onChange, name = 'phone', required = false }) {
  return <InternationalPhoneInput
    international
    defaultCountry="BJ"
    countryCallingCodeEditable={false}
    name={name}
    value={value || undefined}
    onChange={nextValue=>onChange?.(nextValue || '')}
    required={required}
    placeholder="Numéro de téléphone"
    className="international-phone-input mt-2"
  />
}
