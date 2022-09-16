import Game from './Game.js';
import { Route } from 'react-router-dom';
import style from './styles/app.module.css';

function App() {
    return (
        <div id="container">
            <div id="logo" className={style.logo}>
                <h1>Monopoly Deal Online</h1>
            </div>
            <div id="enterName" className={style.enterName}>
                <input type="text" placeholder="Enter your name" />
                <button>Play!</button>
            </div>
            <div id="info" className={style.info}>
                <h1>Test</h1>
            </div>
        </div>)
}

export default App;