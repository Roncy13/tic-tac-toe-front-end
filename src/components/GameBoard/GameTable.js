import React, { Component } from "react";

export default class GameTable extends Component {

  constructor() {
    super();
    this.checkPlayerSymbol = this.checkPlayerSymbol.bind(this);
  }

  checkPlayerSymbol(player, number) {
    
    if (player === "PlayerOne") {
      return "X";
    } else if (player === "PlayerTwo") {
      return "O";
    } else {
      return `${number}`;
    }
  }

  render() {
    const { games: game } = this.props;

    return <table className="table w-25">
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
  }
  
}