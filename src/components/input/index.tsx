
import { RegisterOptions, UseFormRegister } from 'react-hook-form';

interface InputPros {
    type: React.HTMLInputTypeAttribute | undefined;
    placeholder: string;
    name: string;
    register: UseFormRegister<any>;
    error?: string;
    rules?: RegisterOptions;
}

export function Input({ type, placeholder, name, register, rules, error }: InputPros) {
    return (
        <div>
            <input
                className="w-full border-2 rounded-md h-11 px-2"
                placeholder={placeholder}
                type={type}
                {...register(name, rules)}
                id={name}
            />
            {error && (<p className='my-1 text-red-500'>{error}</p>)}
        </div>
    )
}