import { useEffect, useState, useContext } from 'react';

import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/painelheader";
import { FiTrash2 } from 'react-icons/fi';

import { getDocs, collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../service/firebaseConnection';

import { AuthContext } from '../../context/AuthContext';

interface CarsProps {
    id: string;
    name: string;
    year: string;
    uid: string;
    price: string | number;
    city: string;
    km: string;
    images: ImageCarProps[];
}

interface ImageCarProps {
    name: string;
    uid: string;
    url: string;
}

export function Dashboard() {

    const [cars, setCars] = useState<CarsProps[]>([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        function loadCars() {
            if (!user?.uid) return;

            const carRef = collection(db, 'cars');
            const queryref = query(carRef, where("uid", "==", user?.uid))

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

                setCars(listCars);

            });
        }

        loadCars();
    }, [user]);

    async function handleDeleteCar(id: string) {
        const docRef = doc(db, "cars", id);
        await deleteDoc(docRef)
        setCars(cars.filter(car => car.id !== id));
    }

    return (
        <Container>
            <DashboardHeader />

            <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cars.map(car => (
                    <section key={car.id} className="w-full bg-white rounded-lg relative" >

                        <button
                            onClick={() => handleDeleteCar(car.id)}
                            className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow">
                            <FiTrash2 size={26} color="#000" />
                        </button>
                        <img
                            className="w-full rounded-lg mb-2 max-h-70"
                            src={car.images[0].url}
                            alt="foto do carro"
                        />
                        <p className="font-bold mt-1 px-2 mb-2" >{car.name}</p>
                        <div className="flex flex-col px-2">
                            <span className="text-zinc-700" >
                                Ano {car.year} | {car.km} km
                            </span>
                            <strong className="text-black font-bold mt-4">R$ {car.price}</strong>

                        </div>

                        <div className="w-full h-px bg-slate-200 my-2" />
                        <div className="px-2 pb-2" >
                            <span className="text-black"> {car.city}</span>
                        </div>

                    </section>
                ))}
            </main>
        </Container>
    );
}