import React, { Component } from "react";
import DefaultTable from "./DefaultTable";
import GameTable from "./GameTable";

export default class GameBoard extends Component {

  render() {
    const RenderTable = Object.keys(this.props.game || {}).length > 0 ? GameTable : DefaultTable;

    return <RenderTable games = { this.props.game }/>
  }
}