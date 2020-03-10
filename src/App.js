import React, { Component } from 'react';
import './App.css';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlayerListing from './components/PlayerListing';
import GameBoard from './components/GameBoard/GameBoard';

import Modal from 'react-modal';
import axios from 'axios';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width: '50%',
    height: '100%'
  }
};
 
// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root')

export default class App extends Component {
  state = {
    socket: {},
    game: {},
    room: "",
    placeChip: "",
    name: "",
    players: {},
    turn: "",
    modalIsOpen: false,
    scores: [],
    chips: ["1","2","3","4","5","6","7","8","9"]
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
    this.openModal = this.openModal.bind(this);
    this.sendRoomValue = this.sendRoomValue.bind(this);

    this.initialize();
  }

  resetState() {
    this.setState({
      socket: {},
      game: {},
      room: "",
      placeChip: "",
      players: {},
      turn: ""
    }, () => {
      this.setInitialize();
    });
  }

  stateName({ target: { value: name } }) {
    this.setState({
      name
    });
  }

  initialize() {
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

    if (!this.state.chips.includes(placeChip)) {
      toast.error("Only Chips 1-9 are allowed");
      return;
    }

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

    this.state.socket.on("draw", () => {
      this.state.socket.emit("removePlayer", { room: this.state.room })
      this.resetState();
      toast.info("Game is draw");
    });

    this.state.socket.on("winner", (payload) => {
      const { winner, score } = payload,
        { players } = this.state,
        playerTypes = Object.keys(players || {}),
        findPlayer = playerTypes.find(row => players[row].playerName === winner);

      toast.success(`${ findPlayer === 'PlayerOne' ? 'Player 1' : 'Player 2' } wins`);

      if (this.state.name === winner) {
        toast.success(`Your Score is ${score}`);
      } else {
        toast.error(`You Lose The Game...!`);
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

  openModal() {
    axios.get('http://localhost:3000/tic-tac-toe')
      .then(({ data }) => {
        this.setState({
          modalIsOpen: true,
          scores: data || []
        });
      });
  }
  
  render() {

    const { turn, players, game } = this.state;
    const checkGames = Object.keys(game || {}).length;

    return (
      <div className="App row w-100">
        <div className = "col-lg-12 col-md-12 mx-5 mt-2">
          <ToastContainer />
        </div>

        <div className = "col-lg-12 col-md-12 mx-5 mt-2 d-flex">
          <button className = "btn btn-info btn-md" onClick = { this.openModal }>Show Scores</button>
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
            <input id = "placeChip" value = {this.state.placeChip} className = "form-control" type = "text" onChange = { this.placeChip } ></input>
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

        <div className = "col-lg-12 col-md-12 mt-3 d-flex justify-content-center">
          <Modal
            isOpen={this.state.modalIsOpen}
            style={customStyles}
            contentLabel="Game Scores"
          > 
            <div className="col-lg-12 col-md-12 mt-3 d-flex justify-content-center">
              <h3>High Scores</h3>
            </div>
            
            <div className="col-lg-12 col-md-12 mt-3 d-flex justify-content-end">
              <button className = "btn btn-danger btn-sm" onClick={ () => this.setState({ modalIsOpen: false })}>X</button>
            </div>

            <div className="col-lg-12 col-md-12 mt-3">
              <table className="table w-100">
                <thead>
                  <tr>
                    <th className = "th"></th>
                    <th className = "th">
                      Name
                    </th>
                    <th className = "th">
                      Score
                    </th>
                    <th className = "th">
                      Room
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.scores.map((row, index) => (
                      <tr key = { row._id } >
                        <td>
                          { index + 1 }
                        </td>
                        <td>
                          { row.winner}
                        </td>
                        <td>
                          { row.score}
                        </td>
                        <td>
                          { row.room}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </Modal>
        </div>

      </div>
    );
  } 
}
