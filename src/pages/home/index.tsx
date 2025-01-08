import { useState, useEffect, useContext } from "react";
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../service/firebaseConnection';

import { Link } from 'react-router-dom';

import { Container } from "../../components/container";


interface CarsProps {
    id: string;
    name: string;
    year: string;
    uid: string;
    price: string | number;
    city: string;
    km: string;
    images: CarImageProps[];
}

interface CarImageProps {
    name: string;
    uid: string;
    url: string;
}

export function Home() {

    const [car, setCar] = useState<CarsProps[]>([]);
    const [loadImage, setLoadImage] = useState<string[]>([]);

    useEffect(() => {
        function loadCars() {
            const carRef = collection(db, 'cars');
            const queryref = query(carRef, orderBy('created', 'desc'))

            getDocs(queryref).then((snapshot) => {
                let listCars: CarsProps[] = [];

                snapshot.forEach(doc => {
                    listCars.push({
                        id: doc.id,
                        name: doc.data().name,
                        year: doc.data().year,
                        city: doc.data().city,
                        images: doc.data().images,
                        km: doc.data().km,
                        price: doc.data().price,
                        uid: doc.data().uid,
                    });
                });

                setCar(listCars);

            });
        }

        loadCars();
    }, []);

    function handleImageLoad(id: string) {
        setLoadImage((prevImageLoads) => [...prevImageLoads, id]);
    }

    return (
        <Container>
            <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
                <input
                    placeholder="Digite o nome do carro..."
                    className="w-full border-2 rounded-lg h-9 px-3 outline-none"
                />
                <button
                    className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg"
                >
                    Buscar
                </button>
            </section>
            <h1
                className="font-bold text-center mt-6 text-2xl mb-4"
            >Carros novos e usados em todo Brasil
            </h1>

            <main
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
                {car.map(car => (
                    <Link to={`/car/${car.id}`} key={car.id} >
                        <section

                            className="w-full bg-white rounded-lg"
                        >
                            <div
                                style={{ display: loadImage.includes(car.id) ? 'none' : 'block' }}
                                className="w-full h-72 rounded-lg bg-slate-200" ></div>
                            <img
                                key={car.images[0].name}
                                className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                                src={car.images[0].url}
                                alt={car.images[0].name}
                                style={{ display: loadImage.includes(car.id) ? 'block' : 'none' }}
                                onLoad={() => handleImageLoad(car.id)}
                            />

                            <p
                                className="font-bold mt-1 px-2"
                            >{car.name}</p>
                            <div
                                className="flex flex-col px-2"
                            >
                                <span
                                    className="text-zinc-700 mb-6"
                                >Ano {car.year} | ${car.km} KM</span>
                                <strong
                                    className="text-black font-medium text-xl"
                                >R$ {car.price}</strong>
                            </div>

                            <div className="w-full h-px bg-slate-200 my-2"></div>

                            <div className="px-2 pb-2" >
                                <span className="text-zinc-700 mb-6">{car.city}</span>
                            </div>
                        </section>
                    </Link>

                ))}

            </main>
        </Container>
    );
}