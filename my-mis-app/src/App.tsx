import Header from './components/Header.tsx';
import {LoginPage} from "./pages/LoginPage.tsx";
import {RegistrPage} from "./pages/RegistrPage.tsx";
import { Routes, Route } from 'react-router-dom'
function App() {

  return (
    <>
        <Header />
        <main>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registration" element={<RegistrPage />}/>
            </Routes>
        </main>
    </>
  )
}

export default App
