import React from 'react';
import "./MeetingView.css"
import { GRID_NO_SELECTION, GRID_CELL_UNSELECTED, GRID_CELL_SELECTED } from './constants.js'

/**
 * Constructor takes in the following:
 * @param {int} row int: cell row in grid
 * @param {int} column int: cell column in grid
 * @param {int} timestamp int: time that cell refers to
 * @param {int} selected int: whether cell is initially selected (start with GRID_CELL_UNSELECTED)
 * 
 * Pass in the following functions in props:
 * - void updateCurrentSelectionState(int selectionStatus)
 * - void updateCurrentMousePos(int row, int col)
 * - bool checkCellInside(int row, int col)
 */
class TimeCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            row: props.row,
            column: props.column,
            timestamp: props.timestamp,
            selected: props.status,
        }
        this.updateCurrentSelectionState = props.updateCurrentSelectionState; // pass in state update callback into cell, state in parent
        this.updateCurrentMousePos = props.updateCurrentMousePos;
        this.checkCellInside = this.props.checkCellInside;
    }

    selectFromHere = () => {
        // Take state of selected cell as selection state
        // console.log("Select From Here", this.state.row, this.state.column,
        //     this.state.selected);
        this.updateCurrentSelectionState(this.state.selected);

    }

    selectToHere = () => {
        // update selection
        // console.log("Select To Here", this.state.row, this.state.column);
        this.updateCurrentMousePos(this.state.row, this.state.column);
    }

    componentDidUpdate(prevProps) {
        if (this.props.status !== prevProps.status) {
            // console.log("Component did update", this.state.row, this.state.column)
            this.setState({ ...this.state, selected: this.props.status });
            this.forceUpdate();
        }
        // console.log("Component did update", this.state.row, this.state.column)
    }

    render() {
        const [ins, sel] = this.checkCellInside(this.state.row, this.state.column)
        const cur_sel = this.state.selected;
        // console.log("Render: ", { ...this.state, ins: ins, sel: sel, cur_sel: cur_sel })
        const classString = "meeting-time-cell " + (cur_sel === GRID_NO_SELECTION ? "meeting-time-cell-unavailable" : (
            (this.props.activeSelection !== GRID_NO_SELECTION && ins) ? (
                sel === GRID_CELL_SELECTED ? "meeting-time-cell-selected" : "meeting-time-cell-unselected"
            ) : (
                cur_sel === GRID_CELL_SELECTED ? "meeting-time-cell-selected" : "meeting-time-cell-unselected"
            )
        ));
        return (<div className={classString}
            onMouseDown={this.selectFromHere}
            onMouseEnter={this.selectToHere}
        >
            {/* <p>Time: {this.state.timestamp + this.state.row + this.state.column}</p>
            <p>ClassName: {classString}</p> */}
        </div>)
    }
}

export default TimeCell;