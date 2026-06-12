import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function FormInput({
    label,
    name,
    value,
    onChange,
    error,
    type = 'text',
    required = false,
    placeholder = '',
    disabled = false,
    className = '',
}) {
    return (
        <div className={className}>
            <InputLabel
                htmlFor={name}
                value={label}
                className="text-dark-700"
            />
            <TextInput
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                className="mt-1.5 border-dark-300 bg-white focus:border-primary-500 focus:ring-primary-500"
            />
            {error && <InputError message={error} className="mt-1.5" />}
        </div>
    );
}
