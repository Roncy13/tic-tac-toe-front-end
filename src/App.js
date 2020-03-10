import React, { Component } from 'react';
import './App.css';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlayerListing from './components/PlayerListing';

export default class App extends Component {
  state = {
    socket: {},
    game: {},
    room: "",
    placeChip: "",
    name: "",
    players: {},
    turn: ""
  }

  constructor() {
    super();
  
    this.initialize = this.initialize.bind(this);
    this.addNumber = this.addNumber.bind(this);
    this.receivedPlacement = this.receivedPlacement.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.placeChip = this.placeChip.bind(this);
    this.sendChip = this.sendChip.bind(this);
    this.stateName = this.stateName.bind(this);
    this.renderGame = this.renderGame.bind(this);
    this.resetState = this.resetState.bind(this);
    this.checkPlayerSymbol = this.checkPlayerSymbol.bind(this);
    this.renderListOfPlayers = this.renderListOfPlayers.bind(this);
  }

  resetState() {
    this.setState({
      socket: {},
      game: {},
      room: "",
      placeChip: "",
      name: "",
      players: {},
      turn: ""
    });
  }

  stateName({ target: { value: name } }) {
    this.setState({
      name
    });
  }

  initialize() {
    this.sendRoomValue = this.sendRoomValue.bind(this);
    
    this.setState({
      socket: io.connect("http://localhost:4001/game")
    }, () => {
      this.state.socket.on('connect', () => { 
        console.log("Connected Successfully");
      });
  
      this.receivedPlacement();
      this.state.socket.on("disconnect", () => {
        this.state.socket.emit("removePlayer", { room: this.state.room })
      });
    });
  }
  
  placeChip({ target: { value: placeChip } }) {
    this.setState({
      placeChip
    });
  }

  sendChip() {
    const { room, placeChip } = this.state;

    this.state.socket.emit("placeChip", { room, placeChip });
  }

  receivedPlacement() {
    this.state.socket.on("receivedRoom", (payload) => {
      const { game, room, players, turn } = payload;

      if (Object.keys(this.state.game).length === 0) {
        toast.success(`You are now connected in room: ${room}`);
      }

      this.setState({
        game,
        players,
        turn
      });
    });

    this.state.socket.on("players", (payload) => {
      console.log("players ", payload);
    });

    this.state.socket.on("message", (payload) => {
      const { type = "info", message } = payload;

      toast[type](message);
    });

    this.state.socket.on("receivedChips", (payload) => {
      const { games: game, turn } = payload;

      this.setState({
        game,
        turn
      });
    });

    this.state.socket.on("winner", (payload) => {
      const { winner, score } = payload;

      if (this.state.name === winner) {
        toast.success(`You Win the Game, Your Score is ${score}`);
      } else {
        toast.error(`You Lose...!`);
      }

      this.resetState();
    });
  }

  sendRoomValue() {
    const { room, name } = this.state;

    this.state.socket.emit("createdRoom", { room, name });
  }

  addNumber({ target: { value } }) {
    this.setState({
      room: value
    });
  }

  joinRoom() {
    const {
      name, room
    } = this.state;

    this.state.socket.emit("joinRoom", { room, name });
  }

  componentWillMount() {
    this.initialize();
  }

  renderTable = () => (
    <table className="table w-25">
      <tbody>
        <tr>
          <td>1</td>
          <td>2</td>
          <td>3</td>
        </tr>
        <tr>
          <td>4</td>
          <td>5</td>
          <td>6</td>
        </tr>
        <tr>
          <td>7</td>
          <td>8</td>
          <td>9</td>
        </tr>
      </tbody>
    </table>
  )

  checkPlayerSymbol(player, number) {
    
    if (player === "PlayerOne") {
      return "X";
    } else if (player === "PlayerTwo") {
      return "O";
    } else {
      return `${number}`;
    }
  }

  renderGame() {

    const game = this.state.game;

    return (
      <table className="table w-25">
        <tbody>
          <tr>
            <td>{ this.checkPlayerSymbol(game[1],1) || 1 }</td>
            <td>{ this.checkPlayerSymbol(game[2],2) || 2 }</td>
            <td>{ this.checkPlayerSymbol(game[3],3) || 3 }</td>
          </tr>
          <tr>
            <td>{ this.checkPlayerSymbol(game[4],4) || 4 }</td>
            <td>{ this.checkPlayerSymbol(game[5],5) || 5 }</td>
            <td>{ this.checkPlayerSymbol(game[6],6) || 6 }</td>
          </tr>
          <tr>
            <td>{ this.checkPlayerSymbol(game[7],7) || 7 }</td>
            <td>{ this.checkPlayerSymbol(game[8],8) || 8 }</td>
            <td>{ this.checkPlayerSymbol(game[9],9) || 9 }</td>
          </tr>
        </tbody>
      </table>
    );
  }

  renderListOfPlayers() {
    const players = this.state.players;
    const playerLength = Object.keys(players).length;

    return (
       playerLength > 0 ? 
        <table className="table w-25">
          <tbody>
            { 
              ("PlayerOne" in players) &&
                <tr>
                  <td>Player One</td>
                  <td>{ players.PlayerOne.playerName }</td>
                  <td>X</td>
                </tr>
            }
            { 
              ("PlayerTwo" in players) &&
                <tr>
                  <td>Player Two</td>
                  <td>{ players.PlayerTwo.playerName }</td>
                  <td>O</td>
                </tr>
            }
            { 
              (playerLength === 2) &&
                <tr>
                  <td>Players Turn</td>
                  <td>{ this.state.turn || "" }</td>
                </tr>
            }
          </tbody>
      </table> :
      <table></table>
    );

  }

  render() {

    const Table = Object.keys(this.state.game).length === 0 ? this.renderTable : this.renderGame;
    const { turn, players } = this.state;
    return (
      <div className="App">
        <ToastContainer />
        Type here:
        
        <input className = "form-control" type = "text" defaultValue = { this.state.name } onChange = { this.stateName } ></input>
     
        <br/>

        <input className = "form-control" type = "text" onChange = { this.addNumber } ></input>
        <button defaultValue = { this.state.room } onClick = { this.sendRoomValue }>Send room</button>
        <button onClick = { this.joinRoom }>Join room</button>
        <br/>

        <input className = "form-control" type = "text" defaultValue = { this.state.placeChip } onChange = { this.placeChip } ></input>
        <button onClick = { this.sendChip }>Place Chip</button>

        <br />
        <br />
        <br />
        <br />

        <PlayerListing players={ players } turn = { turn }/>

        <br />
        <br />
        {
          Table()
        }

      </div>
    );
  } 
}
