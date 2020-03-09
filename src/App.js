import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';

export default class App extends Component {
  socket = {};
  game = {};
  room = "room-sample";

  constructor() {
    super();
  
    this.initialize = this.initialize.bind(this);
    this.addNumber = this.addNumber.bind(this);
    this.receivedPlacement = this.receivedPlacement.bind(this);
    this.joinRoom = this.joinRoom.bind(this);

    this.initialize(); 
    this.receivedPlacement();
  }

  initialize() {
    this.sendRoomValue = this.sendRoomValue.bind(this);
    
    this.socket = io.connect("http://localhost:4001/game");
    this.socket.on('connect', () => { 
      console.log("Connected Successfully");
    });
  }

  receivedPlacement() {
    this.socket.on("result", (payload) => {
      console.log("result", payload)
    });

    this.socket.on("receivedRoom", (payload) => {
      console.log("receivedRoom", payload);
    });
  }

  sendRoomValue() {
    this.socket.emit("createdRoom", { room: this.room });
  }

  addNumber({ target: { value } }) {
    this.room = value;
  }

  joinRoom() {
    this.socket.emit("joinRoom", { room: this.room });
  }

  render() {
    return (
      <div className="App">
        Type here:
        <input type = "text" onChange = { this.addNumber } ></input>
        <button onClick = { this.sendRoomValue }>Send room</button>
        <button onClick = { this.joinRoom }>Join room</button>
      </div>
    );
  } 
}
