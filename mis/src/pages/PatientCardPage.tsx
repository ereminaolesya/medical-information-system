import './css/PatientCardPage.css';

export function PatientCardPage() {

    return (
        <div className="patient-card">
            <div className="patient-header">
                <h2>Медицинская карта пациента</h2>
                <div>
                    <button>Добавить осмотр</button>
                </div>
            </div>
            <div className="patient-info">
                <div className="patient-name">
                    <h3>name</h3>
                    <span>pol</span>
                </div>
                <span>Дата рождения: date</span>
            </div>
            <div className="patient-filters">
                <div className="patient-filters-row1">
                    <div className="patient-filters-cell">
                        <label>МКБ-10</label>
                        <select className="">
                            <option value="">Выбрать</option>
                        </select>
                    </div>
                    <div className="patient-filters-radio">
                        <label className="radio">
                            <input type="radio"></input>
                            <span className="radio-made"></span>
                        </label>
                        <span>Сгруппировать по повторным</span>
                    </div>
                    <div className="patient-filters-radio">
                        <label className="radio">
                            <input type="radio"></input>
                            <span className="radio-made"></span>
                        </label>
                        <span>Показать все</span>
                    </div>
                </div>

                <div className="patients-filters-row">
                    <div className="patients-filters-cell">
                        <label>Число пациентов на странице</label>
                        <select>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                    <div className="patients-filters-searchButton">
                        <button className="searchButton">Поиск</button>
                    </div>
                </div>
            </div>
            <div className="patient-list">
                <div className="patient">
                    <div className="patient-inspection-header">
                        <div className="patient-inspname">
                            <span className="dataInspection">data</span>
                            <strong>абм осмотр</strong>
                        </div>
                        <div className="patient-buttons">
                            <button>Добавить осмотр</button>
                            <button>Детали осмотра</button>
                        </div>
                    </div>
                    <span>Заключение: <span className="">ыы</span></span>
                    <span>Основной диагноз: <strong>ыы</strong></span>
                    <span className="patientText">Медицинский работник: ыыы</span>
                </div>
            </div>
            <div className="pages">
                <button className="buttonsPage">&lt;</button>
                <button className="buttonsPage" ></button>
                <button className="buttonsPage">&gt;</button>
            </div>
        </div>
    )
}