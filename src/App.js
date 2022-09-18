import Game from './Game.js';
import HomePage from './components/HomePage.js';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

function App() {

    const [username, setUsername] = useState(null);

    function updateName(name) {
        setUsername(name);
    }

    return (<div>
                <Routes>
                    <Route path="/" element={<HomePage callback={updateName}/>} />
                    <Route path="/play" element={<Game username={username}/>} />
                </Routes>
            </div>)
}

export default App;