import React, { Component } from 'react';
import './App.css';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlayerListing from './components/PlayerListing';
import GameBoard from './components/GameBoard/GameBoard';

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
  
    this.setInitialize();
  }

  setInitialize() {
    this.initialize = this.initialize.bind(this);
    this.addNumber = this.addNumber.bind(this);
    this.receivedPlacement = this.receivedPlacement.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.placeChip = this.placeChip.bind(this);
    this.sendChip = this.sendChip.bind(this);
    this.stateName = this.stateName.bind(this);
    this.resetState = this.resetState.bind(this);
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
  
  render() {

    const { turn, players, game } = this.state;

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

        <GameBoard  game = { game }/>

      </div>
    );
  } 
}
