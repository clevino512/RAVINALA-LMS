import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

export default function FormTextarea({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    placeholder = '',
    rows = 3,
    className = '',
}) {
    return (
        <div className={className}>
            <InputLabel
                htmlFor={name}
                value={label}
                className="text-dark-700"
            />
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                rows={rows}
                className="input-textarea mt-1.5"
            />
            {error && <InputError message={error} className="mt-1.5" />}
        </div>
    );
}
