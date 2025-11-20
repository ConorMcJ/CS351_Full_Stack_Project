import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MainMenu from "./pages/MainMenu";
import GameScreen from "./pages/GameScreen";
import GameOver from "./pages/GameOver";
import FigmaComponent from "./FigmaComponent";

export default  function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/menu" element={<MainMenu />} />
            <Route path="/play" element={<GameScreen />} />
            <Route path="/over" element={<GameOver />} />
            <FigmaComponent/>
        {/*default: go to login*/}
        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}