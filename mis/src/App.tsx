import Header from './components/Header.tsx';
import {LoginPage} from "./pages/LoginPage.tsx";
import {RegistrPage} from "./pages/RegistrPage.tsx";
import {ProfilePage} from "./pages/ProfilePage.tsx";
import { Routes, Route } from 'react-router-dom'
import {PatientsPage} from "./pages/PatientsPage.tsx";
import {PatientCardPage} from "./pages/PatientCardPage.tsx";
function App() {

  return (
    <>
        <Header />
        <main>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registration" element={<RegistrPage />}/>
                <Route path="/profile" element={<ProfilePage />}/>
                <Route path="/patients" element={<PatientsPage />}/>
                <Route path="/patient/:id" element={<PatientCardPage />} />
            </Routes>
        </main>
    </>
  )
}

export default App
