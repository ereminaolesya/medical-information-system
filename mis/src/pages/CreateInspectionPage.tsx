import './css/PatientCardPage.css';

export function CreateInspectionPage() {

    return (
        <div className="patient-card">
            <div className="patient-header">
                <h2>Создание осмотра</h2>
            </div>
            <div className="patient-info">
                <div className="patient-info-header">
                    <div className="patient-name">
                        <h3>name</h3>
                        <span>
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="14" r="6" stroke="blue" stroke-width="2" fill="none"/>
                                <line x1="15" y1="9" x2="22" y2="2" stroke="blue" stroke-width="2" stroke-linecap="round"/>
                                <line x1="17" y1="2" x2="22" y2="2" stroke="blue" stroke-width="2" stroke-linecap="round"/>
                                <line x1="22" y1="2" x2="22" y2="7" stroke="blue" stroke-width="2" stroke-linecap="round"/>
                            </svg><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="9" r="6" stroke="blue" stroke-width="2" fill="none"/>
                                <line x1="12" y1="15" x2="12" y2="23" stroke="blue" stroke-width="2"/>
                                <line x1="8" y1="19" x2="16" y2="19" stroke="blue" stroke-width="2"/>
                            </svg></span>
                    </div>
                    <span>Дата рождения: date</span>
                </div>
                <div className="insp-info">
                    <div>перв/повторн</div>
                    <input type="datetime-local"></input>
                </div>
            </div>
            <div>
                <h3>Жалобы</h3>
                <input type="text"></input>
            </div>
            <div>
                <h3>Анамнез заболевания</h3>
                <input type="text"></input>
            </div>
            <div>
                <h3>Консультация</h3>
                <div>
                    <div>
                        <input type="checkbox"></input>
                        <label>Требуется консультация</label>
                    </div>
                    <select>
                        <option>Специализация консультанта</option>
                    </select>
                </div>
                <input type="text"></input>
                <button><svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="white" stroke-width="3"
                          stroke-linecap="round" stroke-linejoin="round"/>
                </svg> Добавить консультацию</button>
            </div>
            <div>
                <h3>Диагнозы</h3>
                <div>
                    <label>Болезни</label>
                    <select>
                        <option>Специализация консультанта</option>
                    </select>
                    <input type="text"></input>
                </div>
                <div>
                    <label>Тип диагноза в осмотре</label>
                    <div>
                        <div className="patient-filters-radio">
                            <label className="radio">
                                <input type="checkbox"></input>
                                <span className="radio-made"></span>
                            </label>
                            <span>Основной</span>
                        </div>
                        <div className="patient-filters-radio">
                            <label className="radio">
                                <input type="checkbox"></input>
                                <span className="radio-made"></span>
                            </label>
                            <span>Сопутствующий</span>
                        </div>
                        <div className="patient-filters-radio">
                            <label className="radio">
                                <input type="checkbox"></input>
                                <span className="radio-made"></span>
                            </label>
                            <span>Осложнение</span>
                        </div>
                    </div>
                </div>
                <button><svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="white" stroke-width="3"
                          stroke-linecap="round" stroke-linejoin="round"/>
                </svg> Добавить диагноз</button>
            </div>
            <div>
                <h3>Рекомендации по лечению</h3>
                <input type="text"></input>
            </div>
            <div>
                <h3>Заключение</h3>
                <div>
                    <div>
                        <label>Заключение</label>
                        <select>
                            <option>Болезнь</option>
                        </select>
                    </div>
                    <div>
                        <label>Дата следующего визита</label>
                        <input type="datetime-local"></input>
                    </div>
                </div>
            </div>
            <div>
                <button>Сохранить осмотр</button>
                <button>Отмена</button>
            </div>
        </div>
    )
}