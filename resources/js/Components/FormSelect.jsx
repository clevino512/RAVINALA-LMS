import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

export default function FormSelect({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    children,
    className = '',
}) {
    return (
        <div className={className}>
            <InputLabel
                htmlFor={name}
                value={label}
                className="text-dark-700"
            />
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="input-select mt-1.5"
            >
                {children}
            </select>
            {error && <InputError message={error} className="mt-1.5" />}
        </div>
    );
}
