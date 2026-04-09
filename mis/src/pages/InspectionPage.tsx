import './css/InspectionPage.css';
import {useQuery} from "@tanstack/react-query";
import {api} from "../api/axios.ts";
import {useParams} from "react-router-dom";
import {useState} from "react";
import {EditInspectionModal} from "../components/EditInspectionModal.tsx";


export function InspectionPage() {

    const { id } = useParams();

    const { data: inspection, isLoading } = useQuery({
        queryKey: ["inspection", id],
        queryFn: async () => {
            const res = await api.get(`/inspection/${id}`);
            return res.data;
        },
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) return <div>Загрузка...</div>;
    return (
        <div className="patient-card">
            <div className="patient-info">
                <div className="patient-header-inspection">
                    <h1>Амбулаторный осмотр от </h1>
                    <button className="saveBtn" type="button" onClick={() => setIsModalOpen(true)}>Редактировать осмотр</button>
                </div>
                {/*<div className="patient-info-header">*/}
                    <div className="patient-info-insp">
                        <strong className="patient-name-insp">Пациент: {inspection.patient?.name}</strong>
                        <p>Пол: {inspection.patient?.gender === "Male" ? "Мужской" : "Женский"}</p>
                        <p>Дата рождения: {new Date(inspection.patient?.birthday).toLocaleDateString()}</p>
                    </div>
                <p className="doc">Медицинский работник: {inspection.doctor.name}</p>
                {/*</div>*/}
            </div>
            <div className="patient-info">
                <h3>Жалобы</h3>
                <p>{inspection.complaints}</p>
            </div>
            <div className="patient-info">
                <h3>Анамнез заболевания</h3>
                <p>{inspection.anamnesis}</p>
            </div>

            {inspection.consultations.map((item: any) => (
            <div className="patient-info">
                <h3>Консультация</h3>
                <strong>Консультант: {item.rootComment?.author?.name}</strong>
                <p className="doc">Специализация консультанта: {item.speciality.name}</p>
                <p>Комментарий: {item.rootComment?.content}</p>
            </div>))}

            <div className="patient-info">
                <h3>Диагнозы</h3>
                {inspection?.diagnoses.map((item: any) => (
                    <div className="diagnosesInfo" key={item.id}>
                        <strong>{item.code} - {item.name}</strong>
                        <div><p>Тип в осмотре: {item.type === 'Main' ? "Основной" : item.type === 'Concomitant' ? "Сопутствующий" : "Осложнение"}</p>
                            <p>Расшифровка: {item.description}</p></div>
                    </div>)
                )}
            </div>
            <div className="patient-info">
                <h3>Рекомендации по лечению</h3>
                <p>{inspection.treatment}</p>
            </div>
            <div className="patient-info">
                <h3>Заключение</h3>
                <strong>{inspection.conclusion === "Death" ? "Смерть" : inspection.conclusion === "Recovery" ? "Выздоровление" : "Болезнь"}</strong>
                {inspection.conclusion === "Disease" && (
                    <p>Дата следующего визита: {new Date(inspection.nextVisitDate).toLocaleString()}</p>
                )}

                {inspection.conclusion === "Death" && (
                    <p>Дата смерти: {new Date(inspection.deathDate).toLocaleString()}</p>
                )}
            </div>
            {isModalOpen && (<EditInspectionModal onClose={() => setIsModalOpen(false)} id={id} />)}
        </div>
    )
}