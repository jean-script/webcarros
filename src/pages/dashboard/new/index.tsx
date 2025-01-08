import { ChangeEvent, useState, useContext } from "react";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/painelheader";
import { FiUpload, FiTrash } from 'react-icons/fi'

import { AuthContext } from '../../../context/AuthContext';

import { useForm } from 'react-hook-form';
import { Input } from "../../../components/input";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";

import { v4 as uuidV4 } from 'uuid';
import { storage, db } from '../../../service/firebaseConnection';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import { addDoc, collection } from 'firebase/firestore';

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório"),
    model: z.string().nonempty("O modelo é obrigatório"),
    year: z.string().nonempty("O Ano do carro é obrigatório"),
    km: z.string().nonempty("O KM do carro é obrigatório"),
    price: z.string().nonempty("O Preço é obrigatório"),
    city: z.string().nonempty("A cidade é obrigatória"),
    whatsapp: z.string().min(1, "O Telefone é obrigatório").refine((value) => /^(\d{10,11})$/.test(value), {
        message: "Numero de telefone invalido."
    }),
    description: z.string().nonempty("A descrição é obrigatoria"),
});

type FormData = z.infer<typeof schema>;


interface ImageItemProps {
    uid: string;
    name: string;
    previewUrl: string;
    url: string;
}


export function New() {

    const { user } = useContext(AuthContext);
    const [carImages, setCarImages] = useState<ImageItemProps[]>([]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });


    function onSubmit(data: FormData) {

        if (carImages.length === 0) {
            return alert("Envie uma image deste carro");
        }

        const cartListImage = carImages.map(car => {
            return {
                uid: car.uid,
                name: car.name,
                url: car.url,
            }
        });

        addDoc(collection(db, "cars"), {
            name: data.name,
            model: data.model,
            whatsapp: data.whatsapp,
            city: data.city,
            year: data.year,
            km: data.km,
            price: data.price,
            description: data.description,
            created: new Date(),
            owner: user?.name,
            uid: user?.uid,
            images: cartListImage,
        }).then(() => {
            reset();
            setCarImages([]);
            console.log('CADASTRADO COM SUCESSO!');
        }).catch((err) => {
            console.log(err);
            console.log('Erro ao cadastrar no banco');


        })

    }

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const image = e.target.files[0];

            if (image.type === 'image/jpeg' || image.type === 'image/png') {
                await handleUpload(image);
            } else {
                alert("Envie uma imagem jpg ou png")
            }

        }
    }

    async function handleUpload(image: File) {
        if (!user?.uid) return;

        const currendUid = user?.uid;
        const uidImage = uuidV4();

        const uploadRef = ref(storage, `images/${currendUid}/${uidImage}`);

        uploadBytes(uploadRef, image)
            .then((snapshot) => {
                getDownloadURL(snapshot.ref).then((downloadUrl) => {
                    const imageItem: ImageItemProps = {
                        name: uidImage,
                        uid: currendUid,
                        previewUrl: URL.createObjectURL(image),
                        url: downloadUrl
                    };

                    setCarImages((images) => [...images, imageItem]);
                });
            });

    }

    async function handleDeleteImage(item: ImageItemProps) {
        const imagePath = `images/${item.uid}/${item.name}`;

        const imageRef = ref(storage, imagePath);
        try {
            await deleteObject(imageRef)
            setCarImages(carImages.filter(car => car.url !== item.url));
        } catch (error) {
            console.log('Error ao deletar');
        }
    }

    return (
        <Container>
            <DashboardHeader />
            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
                <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-grey-600 h-32 md:w-48" >
                    <div className="absolute cursor-pointer">
                        <FiUpload size={30} color="#000" />
                    </div>

                    <div className="cursor-pointer h-full">
                        <input
                            className="opacity-0 cursor-pointer h-full w-full"
                            type="file"
                            accept="image/"
                            onChange={handleFile}
                        />
                    </div>
                </button>

                {carImages.map(item => (
                    <div key={item.name} className="w-full h-32 flex items-center justify-center relative" >
                        <button className="absolute" onClick={() => handleDeleteImage(item)} >
                            <FiTrash size={28} color="#FFF" />
                        </button>
                        <img src={item.previewUrl}
                            className="rounded-lg w-full h-32 object-cover"
                            alt="foto do carro"
                        />
                    </div>
                ))}

            </div>
            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
                <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <p className="mb-2 font-medium">Nome do carro</p>
                        <Input
                            type="text"
                            register={register}
                            name="name"
                            error={errors.name?.message}
                            placeholder="Ex: Onix 1.0..."
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Modelo do carro</p>
                        <Input
                            type="text"
                            register={register}
                            name="model"
                            error={errors.model?.message}
                            placeholder="Ex: 1.0 flex PLUS MANUAL..."
                        />
                    </div>

                    <div className="w-full flex mb-3 flex-row items-center gap-4">
                        <div className="w-full">
                            <p className="mb-2 font-medium">Ano</p>
                            <Input
                                type="text"
                                register={register}
                                name="year"
                                error={errors.year?.message}
                                placeholder="Ex: 2016/2016"
                            />
                        </div>
                        <div className="w-full">
                            <p className="mb-2 font-medium">KM Rodados</p>
                            <Input
                                type="text"
                                register={register}
                                name="km"
                                error={errors.km?.message}
                                placeholder="Ex: 23.900..."
                            />
                        </div>
                    </div>
                    <div className="w-full flex mb-3 flex-row items-center gap-4">
                        <div className="w-full">
                            <p className="mb-2 font-medium">Telefone/whatsApp</p>
                            <Input
                                type="text"
                                register={register}
                                name="whatsapp"
                                error={errors.whatsapp?.message}
                                placeholder="Ex: 11 93214545"
                            />
                        </div>
                        <div className="w-full">
                            <p className="mb-2 font-medium">Cidade</p>
                            <Input
                                type="text"
                                register={register}
                                name="city"
                                error={errors.city?.message}
                                placeholder="Ex: São paulo..."
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Preço</p>
                        <Input
                            type="text"
                            register={register}
                            name="price"
                            error={errors.price?.message}
                            placeholder="Ex: 69.000..."
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Descrição</p>
                        <textarea
                            className="border-2 w-full rounded-md h-24 px-2"
                            {...register('description')}
                            name="description"
                            id="description"
                            placeholder="Digite a descrição completa sobre o carro..."
                        />
                        {errors.description && <p className="mb-1 text-red-500" >{errors.description.message}</p>}
                    </div>

                    <button type="submit" className="w-full h-10 rounded-md bg-zinc-900 text-white font-medium">
                        Cadastrar
                    </button>
                </form>
            </div>
        </Container>
    );
}