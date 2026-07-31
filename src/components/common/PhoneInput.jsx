import InternationalPhoneInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css'

export default function PhoneInput({ value = '', onChange, name = 'phone', required = false }) {
  return <InternationalPhoneInput
    international
    flags={flags}
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
