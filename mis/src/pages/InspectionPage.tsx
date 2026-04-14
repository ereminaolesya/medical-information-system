import './css/InspectionPage.css';
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {api} from "../api/axios.ts";
import {useParams} from "react-router-dom";
import {useState} from "react";
import {EditInspectionModal} from "../components/EditInspectionModal.tsx";


export function InspectionPage() {

    const { id } = useParams();
    const currentUserId = localStorage.getItem("userId");

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
                    {inspection.doctor?.id === currentUserId && (<button className="saveBtn" type="button" onClick={() => setIsModalOpen(true)}>Редактировать осмотр</button>)}
                </div>
                <div className="patient-info-insp">
                    <strong className="patient-name-insp">Пациент: {inspection.patient?.name}</strong>
                    <p>Пол: {inspection.patient?.gender === "Male" ? "Мужской" : "Женский"}</p>
                    <p>Дата рождения: {new Date(inspection.patient?.birthday).toLocaleDateString()}</p>
                </div>
                <p className="doc">Медицинский работник: {inspection.doctor.name}</p>
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
                <Consult key={item.id} item={item} />
            ))}


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

function CommentList({comments, level = 0, parentId, mutation, editMutation, specialityId, userSpec, speciality} : { comments: any, level: number, parentId: string, mutation: any, editMutation: any, specialityId: string, userSpec: any, speciality: string }) {
    const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});
    const toggle = (id: string) => {
        setIsOpen(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const sortedComments = [...comments].sort((a, b) =>
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    );
    const children = sortedComments.filter(c => c.parentId === parentId);

    const [replyOpen, setReplyOpen] = useState(false);
    const [text, setText] = useState('');

    const [editOpen, setEditOpen] = useState(false);
    const [textEdit, setTextEdit] = useState('');

    const currentUserId = localStorage.getItem("userId");

    return (
        <div className="inspection-row-container" style={{ '--level': level } as React.CSSProperties}>
            {level > 0 && <div className="corner"></div>}
            {children.map(comment => {
                const childCount = comments.filter(c => c.parentId === comment.id).length;
                return (
                    <>
                        <div className="comment">
                            <div className="specName"><strong>{comment.author}</strong> <p className="doc">({speciality})</p></div>

                            {editOpen === comment.id ? (
                                <form className="commentEditForm" onSubmit={(e) => {
                                    e.preventDefault(); editMutation.mutate({ id: comment.id, content: textEdit }); setEditOpen(false); setTextEdit('') }}>
                                    <input value={textEdit} onChange={e => setTextEdit(e.target.value)}></input>
                                    <button type="submit">Редактировать комментарий</button>
                                </form>
                            ) : (
                                <p className="commentText">{comment.content}
                                    {comment.modifiedDate !== comment.createTime && (
                                        <span title={new Date(comment.modifiedDate).toLocaleString()} className="doc">(изменено)</span>
                                    )}
                                </p>
                            )}
                            <div className="commentInfo">
                                <p className="doc">{new Date(comment.createTime).toLocaleString()}</p>
                                {childCount>0 && (<button onClick={() => toggle(comment.id)}>{isOpen[comment.id] ? 'Скрыть ответы' : `Показать ответы (${childCount})`}</button>)}
                                {(comment.authorId === currentUserId || userSpec) &&(<button onClick={() => setReplyOpen(comment.id)}>Ответить</button>)}
                                {comment.authorId === currentUserId && (<button onClick={() => {setEditOpen(comment.id); setTextEdit(comment.content);}}>Редактировать</button>)}
                            </div>
                            {replyOpen === comment.id && (
                                <form className="commentForm" onSubmit={(e) => {e.preventDefault(); mutation.mutate({ content: text, parentId: comment.id }); setReplyOpen(false); setText('') }}>
                                    <input value={text} onChange={e => setText(e.target.value)}></input>
                                    <button type="submit">Оставить комментарий</button>
                                </form>)}
                        </div>
                        <div key={comment.id}>
                            {isOpen[comment.id] && (
                                <CommentList comments={comments} level={level + 1} parentId={comment.id} mutation={mutation} editMutation={editMutation} specialityId={specialityId} userSpec={userSpec} speciality={speciality} />
                            )}
                        </div>
                    </>
                    )
            })}
        </div>
    );
}

function Consult({ item }: { item: any }) {
    const { id } = useParams();
    const { data } = useQuery({
        queryKey: ['consultation', item.id],
        queryFn: async () => {
            const res = await api.get(`/consultation/${item.id}`);
            return res.data;
        }
    });

    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [replyOpen, setReplyOpen] = useState(false);
    const [text, setText] = useState('');
    const mutation = useMutation({
        mutationFn: async ({ content, parentId } : { content: string, parentId: string }) => {
            await api.post(`/consultation/${item.id}/comment`, {
                content,
                parentId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['consultation', item.id]});
            setText('');
            setReplyOpen(false);
        }
    });

    const [editOpen, setEditOpen] = useState(false);
    const [textEdit, setTextEdit] = useState('');

    const currentUserId = localStorage.getItem("userId");

    const editMutation = useMutation({
        mutationFn: async ({ id, content } : { id: string, content: string }) => {
            await api.put(`/consultation/comment/${id}`, {content});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultation', item.id] });
            queryClient.invalidateQueries({ queryKey: ["inspection", id] });
            setTextEdit('');
            setEditOpen(false);
        }
    });

    const { data: mineCons } = useQuery({
        queryKey: ['consultations'],
        queryFn: async () => {
            const res = await api.get('/consultation?page=1&size=1000');
            return res.data.inspections;
        }
    });
    const userSpec = mineCons?.some((c: any) => c.id === id);



    return (
        <div className="patient-info">
            <h3>Консультация</h3>
            <strong>Консультант: {item.rootComment?.author?.name}</strong>
            <p className="doc">Специализация консультанта: {item.speciality.name}</p>
            <h4>Комментарии</h4>
            <div className="comment">
                <div className="specName"><strong>{item.rootComment?.author?.name}</strong> <p className="doc">({item.speciality.name})</p></div>

                {editOpen === item.id ? (
                    <form className="commentEditForm" onSubmit={(e) => {
                        e.preventDefault(); editMutation.mutate({ id: item.rootComment.id, content: textEdit }); setEditOpen(false); setTextEdit('') }}>
                        <input value={textEdit} onChange={e => setTextEdit(e.target.value)}></input>
                        <button type="submit">Редактировать комментарий</button>
                    </form>
                ) : (
                    <p className="commentText">{item.rootComment?.content}
                        {item.rootComment.modifyTime !== item.rootComment.createTime && (
                            <span className="doc" title={new Date(item.rootComment.modifyTime).toLocaleString()}>(изменено)</span>
                        )}
                    </p>)}

                <div className="commentInfo">
                    <p className="doc">{new Date(item.rootComment?.createTime).toLocaleString()}</p>
                    {item.commentsNumber>1 && (<button onClick={() => setIsOpen(!isOpen)}> {isOpen ? 'Скрыть ответы' : `Показать ответы (${item.commentsNumber - 1})`}</button>)}
                    {(item.rootComment?.author?.id === currentUserId || userSpec) && (<button onClick={() => setReplyOpen(item.id)}>Ответить</button>)}
                    {item.rootComment?.author?.id === currentUserId && (<button onClick={() => {setEditOpen(item.id); setTextEdit(item.rootComment?.content);}}>Редактировать</button>)}
                </div>
                {replyOpen === item.id && (
                    <form className="commentForm" onSubmit={(e) => {e.preventDefault(); mutation.mutate({ content: text, parentId: item.rootComment.id })}}>
                        <input value={text} onChange={e => setText(e.target.value)}></input>
                        <button type="submit">Оставить комментарий</button>
                    </form>)}
            </div>
            {isOpen && data?.comments && (
                <CommentList comments={data.comments} level={0} parentId={item.rootComment?.id} mutation={mutation} editMutation={editMutation} specialityId={item.speciality.id} userSpec={userSpec} speciality={item.speciality.name} />
            )}
        </div>
    );
}