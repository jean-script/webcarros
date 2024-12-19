import logoImg from '../../assets/logo.svg';

import { Link, useNavigate } from 'react-router-dom';

import { Container } from '../../components/container';
import { Input } from '../../components/input';

import { useForm } from 'react-hook-form'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'

import { auth } from '../../service/firebaseConnection';
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { useEffect } from 'react';

const schema = z.object({
    name: z.string().nonempty('O campo é obrigatorio!'),
    email: z.string().email('Insira um email válido').nonempty("O campo email é obrigatorio!"),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').nonempty("O campo senha é obrigatório"),
});

type FormData = z.infer<typeof schema>;


export function Register() {

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        async function handleLogout() {
            await signOut(auth);
        }
        handleLogout();
    }, []);

    async function onSubmit(data: FormData) {
        createUserWithEmailAndPassword(auth, data.email, data.password).then(async (user) => {
            await updateProfile(user.user, {
                displayName: data.name,
            });

            console.log('Cadastrado com sucesso');

            navigate('/dashboard', { replace: true });

        }).catch((err) => {
            console.log('ERROR AO CADASTRAR USUÀRIO');
            console.log(err);
        });
    }


    return (
        <Container>
            <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
                <Link to='/' className='mb-6 max-w-sm w-full' >
                    <img
                        src={logoImg}
                        alt='Logo do site'
                        className='w-full'
                    />
                </Link>

                <form onSubmit={handleSubmit(onSubmit)} className='bg-white max-w-xl w-full rounded-lg p-4'>

                    <div className='mb-3'>
                        <Input
                            type='text'
                            placeholder="Digite seu nome completo"
                            name="name"
                            error={errors.name?.message}
                            register={register}
                        />
                    </div>

                    <div className='mb-3'>
                        <Input
                            type=""
                            placeholder="Digite seu email..."
                            name="email"
                            error={errors.email?.message}
                            register={register}
                        />

                    </div>

                    <div className='mb-3'>
                        <Input
                            type='password'
                            placeholder="Digite sua senha..."
                            name="password"
                            error={errors.password?.message}
                            register={register}
                        />
                    </div>


                    <button type='submit' className='bg-zinc-900 w-full rounded-md text-white h-10 font-medium' >
                        Cadastrar
                    </button>
                </form>

                <Link to='/login' >Já possui uma conta? Faça o login</Link>
            </div>
        </Container>
    );
}