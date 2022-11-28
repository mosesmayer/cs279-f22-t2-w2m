import React from 'react';
import "./MeetingView.css"
import { GRID_NO_SELECTION, GRID_CELL_UNSELECTED, GRID_CELL_SELECTED } from './constants.js'

/**
 * Inserted here for reference from TimeCell.js:
 * const GRID_NO_SELECTION = -1; // hex color #505050
 * const GRID_CELL_UNSELECTED = 0; // rgb(255, 222, 222)
 * const GRID_CELL_SELECTED = 1; // rgb(51, 153, 0)
 * // grid cell style is 44px by 9px. rgb(255, 222, 222), rgb(51, 153, 0)
 */

/**
 * Constructor takes in the following:
 * @param {int} row int: cell row in grid
 * @param {int} column int: cell column in grid
 * @param {int} timestamp int: time that cell refers to
 * @param {int} totalAttendees int: number of total attendees for gradient
 * @param {int} numAttending int: number of attendees selecting given cell
 * 
 * Pass in the following functions in props:
 * - void updateCurrentSelectionState(int selectionStatus)
 * - void updateCurrentMousePos(int row, int col)
 * - bool checkCellInside(int row, int col)
 */
class AggregateCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            row: props.row,
            column: props.column,
            timestamp: props.timestamp,
            selected: props.status,
            cellColor: 0xFFFFFF,
        }
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
        if (this.props.style !== prevProps.style) {
            // console.log("Component did update", this.state.row, this.state.column)
            // this.setState({ ...this.state, selected: this.props.status });
            console.log("reset state ", this.props);
            this.setState({ ...this.state, cellColor: this.props.style.backgroundColor })
            this.forceUpdate();
        }
        // console.log("Component did update", this.state.row, this.state.column)
    }

    render() {
        // console.log(this.props.style, this.props.row, this.props.column, this.props.status)
        // const classString = "meeting-time-cell ""
        return (<div className="meeting-time-cell"
            style={
                { backgroundColor: document.documentElement.style.getPropertyValue(`--grid-green-${this.props.status}`) }
            }
        // onMouseDown={this.selectFromHere}
        // onMouseEnter={this.selectToHere}
        >
            {/* <p>Time: {this.state.timestamp + this.state.row + this.state.column}</p>
            <p>ClassName: {classString}</p> */}
            {<p> {this.props.status} </p>}
        </div>)
    }
}

export { AggregateCell }