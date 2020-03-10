import { Component } from "react";

export default class PlayerListing extends Component {

  render() {
    const players = this.props.players || {},
      playerLength = Object.keys(players).length;

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
                  <td>{ this.props.turn || "" }</td>
                  <td>Waiting...</td>
                </tr>
            }
          </tbody>
      </table> :
      <table></table>
    );
  }
}