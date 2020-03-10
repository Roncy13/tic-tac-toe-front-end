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
    const { room, placeChip, socket } = this.state;

    socket.emit("placeChip", { room, placeChip });

    this.setState({
      placeChip: ""
    });
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
    const checkGames = Object.keys(game || {}).length;

    return (
      <div className="App row w-100">
        <div className = "col-lg-12 col-md-12 mx-5 mt-2">
          <ToastContainer />
        </div>
        
        <div className = "col-lg-12 col-md-12 mx-5 mt-2">
          <div className="form-group">
            <label for="yourName">Your Name</label>
            <input id = "yourName" value = {this.state.name} disabled = { checkGames === 0 ? false : true } className = "form-control" type = "text" defaultValue = { this.state.name } onChange = { this.stateName } ></input>
          </div>

          <div className="form-group">
            <label for="roomNo">Room</label>
            <input id = "roomNo"  value = {this.state.room} disabled = { checkGames === 0 ? false : true } className = "form-control" type = "text" onChange = { this.addNumber } ></input>
            </div>

          <div className= { checkGames === 0 ? 'form-group d-flex justify-content-end pr-2' : 'd-none' }>
            <button className = "btn btn-success btn-md mr-1" onClick = { this.sendRoomValue }>Create room</button>
            <button className = "btn btn-info btn-md" onClick = { this.joinRoom }>Join room</button>
          </div>

          <div className={ checkGames > 0 ? 'form-group' : 'd-none' }>
            <label for="placeChip">Place Chip from 1 - 9</label>
            <input id = "placeChip"  value = {this.state.placeChip} className = "form-control" type = "text" onChange = { this.placeChip } ></input>
          </div>

          <div className={ checkGames > 0 ? 'form-group d-flex justify-content-end pr-2' : 'd-none' }>
            <button className = "btn btn-info btn-warning" onClick = { this.sendChip }>Place Chip</button>
          </div>
        </div>
        
        <div className = "col-lg-12 col-md-12 mt-3 d-flex justify-content-center">
          <PlayerListing players={ players } turn = { turn }/>
        </div>
        
        <div className = "col-lg-12 col-md-12 mt-3 d-flex justify-content-center">
          <GameBoard game = { game }/>
        </div>
      </div>
    );
  } 
}
