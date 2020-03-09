import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';

export default class App extends Component {
  state = {
    socket: {},
    game: {},
    room: "",
    placeChip: "",
    name: ""
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

    this.initialize(); 
    this.receivedPlacement();

    this.state.socket.on("disconnect", () => {
      this.state.socket.emit("removePlayer", { room: this.state.room })
    });
  }

  stateName({ target: { value: name } }) {
    this.setState({
      name
    });
  }

  initialize() {
    this.sendRoomValue = this.sendRoomValue.bind(this);
    
    this.state.socket = io.connect("http://localhost:4001/game");
    this.state.socket.on('connect', () => { 
      console.log("Connected Successfully");
    });
  }
  
  placeChip({ target: { value: placeChip } }) {
    this.setState({
      placeChip
    });
    //this.state.socket.emit("placeChip", { chip: this.room });
  }

  sendChip() {
    const { room, placeChip } = this.state;

    this.state.socket.emit("placeChip", { room, placeChip });
  }

  receivedPlacement() {
    this.state.socket.on("receivedRoom", (payload) => {
      console.log(payload);
    });
  }

  sendRoomValue() {
    const { room, name } = this.state;

    this.state.socket.emit("createdRoom", { room, name });
  }

  addNumber({ target: { value } }) {
    this.state.room = value;
  }

  joinRoom() {
    const {
      name, room
    } = this.state;

    this.state.socket.emit("joinRoom", { room, name });
  }

  render() {
    return (
      <div className="App">
        Type here:
        
        <input type = "text" defaultValue = { this.state.name } onChange = { this.stateName } ></input>
     
        <br/>

        <input type = "text" onChange = { this.addNumber } ></input>
        <button defaultValue = { this.state.room } onClick = { this.sendRoomValue }>Send room</button>
        <button onClick = { this.joinRoom }>Join room</button>
        <br/>

        <input type = "text" defaultValue = { this.state.placeChip } onChange = { this.placeChip } ></input>
        <button onClick = { this.sendChip }>Place Chip</button>
      </div>
    );
  } 
}
