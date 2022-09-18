import style from '../styles/HomePage.module.css';
import { Link } from 'react-router-dom';

function HomePage(props) {
    return (
        <div id="container" className={style.container}>
            <div id="logo" className={style.logo}>
                <h1>Monopoly Deal Online</h1>
            </div>
            <div id="enterName" className={style.enterName}>
                <input type="text" placeholder="Enter your name" onChange={(e) => {
                    props.callback(e.target.value);
                }}/>
                <Link to="/play">Play</Link>
            </div>
            <div id="info" className={style.info}>
                <h1>How to play</h1>
                <p>
                    A full explanation of the game's rules can be found <a href="https://monopolydealrules.com/index.php?">here</a>.
                    <br/>
                    <br/>
                    There are three types of cards you can play:
                </p>
                    <ul>
                        <li>Property: Places the property in your pile. All players can see it. If you already have a property of the same colour placed, it goes in that pile.</li>
                        <li>Money: Places money in your money pile. All players can see it. You may also play action/rent cards as money, but not property cards.</li>
                        <li>Action/Rent: With a few exceptions, these cards allow you to interact with other players' properties and money piles, usually by taking them.</li>
                    </ul>
                <p>
                    Your objective is to get 3 different coloured full property sets first. 
                </p>
            </div>
        </div>)
}

export default HomePage;