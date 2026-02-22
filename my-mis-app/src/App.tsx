import Header from './components/Header.tsx';
import {LoginPage} from "./pages/LoginPage.tsx";
import { Routes, Route } from 'react-router-dom'
function App() {

  return (
    <>
        <Header />
        <main>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

            </Routes>
        </main>
    </>
  )
}

export default App
