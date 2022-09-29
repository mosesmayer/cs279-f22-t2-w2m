import React from 'react';
import "./MeetingView.css"

/**
 * Notes
 * w2m makes IDs in the form of YouTime{UnixTimestamp}
 * e.g. YouTime1664975700 refers to a block for Wed Oct 5, 2022, 09:15 GMT-0400 (EDT)
 */


const GRID_NO_SELECTION = -1;
const GRID_CELL_UNSELECTED = 0; // rgb(255, 222, 222)
const GRID_CELL_SELECTED = 1; // rgb(51, 153, 0)
// grid cell style is 44px by 9px. rgb(255, 222, 222), rgb(51, 153, 0)
class TimeCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            row: props.row,
            column: props.column,
            timestamp: props.timestamp,
            // selected: props.status,
        }
        this.getSelected = props.getCellSelectedState;
        this.updateCurrentSelectionState = props.updateCurrentSelectionState; // pass in state update callback into cell, state in parent
        this.updateCurrentMousePos = props.updateCurrentMousePos;
        this.checkCellInside = this.props.checkCellInside;
    }
    // componentWillReceiveProps(nextProps) {
    //     this.setState({ selected: nextProps.status });
    // }
    selectFromHere = () => {
        // Take state of selected cell as selection state
        console.log("Select From Here", this.state.row, this.state.column,
            // this.state.selected);
            this.getSelected(this.state.row, this.state.column));
        // this.updateCurrentSelectionState(this.state.selected);
        this.updateCurrentSelectionState(this.getSelected(this.state.row, this.state.column));
    }

    selectToHere = () => {
        // update selection
        console.log("Select To Here", this.state.row, this.state.column);
        this.updateCurrentMousePos(this.state.row, this.state.column);
    }

    render() {
        const [ins, sel] = this.checkCellInside(this.state.row, this.state.column)
        const cur_sel = this.getSelected(this.state.row, this.state.col);
        // const cur_sel = this.state.selected;
        const classString = "meeting-time-cell " + (cur_sel === GRID_NO_SELECTION ? "meeting-time-cell-unavailable" : (
            ins ? (
                sel === GRID_CELL_SELECTED ? "meeting-time-cell-selected" : "meeting-time-cell-unselected"
            ) : (
                cur_sel === GRID_CELL_SELECTED ? "meeting-time-cell-selected" : "meeting-time-cell-unselected"
            )
        ));
        return (<div className={classString}
            onMouseDown={this.selectFromHere}
            onMouseEnter={this.selectToHere}
        // onMouseUp={() => { console.log(this.state.row, this.state.column) }}
        >
            <p>Time: {this.state.timestamp + this.state.row + this.state.column}</p>
            <p>ClassName: {classString}</p>
        </div>)
    }
}

class TimetableGrid extends React.Component { // contains TimeCells
    constructor(props) {
        // pass in state from parent as part of props
        super(props);
        this.noLaterThan = props.noLaterThan;
        this.MAX_ROWS = 3;
        this.MAX_COLS = 4;
        this.state = {
            selectionMode: GRID_NO_SELECTION,
            row: 0,
            column: 0,
            start_row: 0, end_row: 0,
            start_col: 0, end_col: 0,
            current_status: Array(this.MAX_ROWS * this.MAX_COLS).fill(GRID_CELL_UNSELECTED),
        }
    }

    getCellSelectedState = (row, col) => {
        return this.state.current_status[row * this.MAX_COLS + col];
    }

    updateCurrentSelectionState = (cell_state) => {
        this.setState({
            ...this.state,
            selectionMode: (GRID_CELL_SELECTED + GRID_CELL_UNSELECTED - cell_state),
            start_row: this.state.row,
            start_col: this.state.column,
        });
    }

    updateCurrentMousePos = (row, col) => {
        this.setState({
            ...this.state, row: row, column: col
        })
    }
    // handle onMouseUp here (do the updating stuff)

    updateRange = () => {
        if (this.state.selectionMode === GRID_NO_SELECTION) return;
        let new_status = this.state.current_status;
        for (var i = 0; i < this.MAX_ROWS; i++) {
            for (var j = 0; j < this.MAX_COLS; j++) {
                if (this.insideSelection(i, j)[0]
                    // if (Math.min(this.state.start_row, this.state.row) <= i && i <= Math.max(this.state.start_row, this.state.row)
                    //     && Math.min(this.state.start_col, this.state.col) <= j && j <= Math.max(this.state.start_col, this.state.col)
                ) {
                    console.log("Update", i, j)
                    new_status[i * this.MAX_COLS + j] = this.state.selectionMode;
                }
            }
        }
        console.log("SELECTION MODE", this.state.selectionMode, "NEW STATUS: ", new_status)
        this.setState({
            ...this.state,
            end_row: this.state.row,
            end_col: this.state.column,
            selectionMode: GRID_NO_SELECTION,
            current_status: new_status,
        })
        // console.log(this.state.start_row, this.state.start_col, this.state.end_row, this.state.end_col);
        console.log(this.state); //so state gets updated. why cells no update????
    }

    insideSelection = (row, col) => {
        const mnrow = Math.min(this.state.start_row, this.state.row);
        const mxrow = Math.max(this.state.start_row, this.state.row);
        const mncol = Math.min(this.state.start_col, this.state.column);
        const mxcol = Math.max(this.state.start_col, this.state.column);
        return [(mnrow <= row && row <= mxrow) && (mncol <= col && col <= mxcol), this.state.selectionMode];
    }

    constructTimeCells = () => {
        console.log("Reconstruct", Date.now());
        let elements = [];
        for (var i = 0; i < this.MAX_ROWS; i++) {
            let cur_row = [];
            for (var j = 0; j < this.MAX_COLS; j++) {
                cur_row.push(
                    <TimeCell key={i * this.MAX_COLS + j} row={i} column={j} timestamp={Date.now()}
                        // status={elt}
                        getCellSelectedState={this.getCellSelectedState}
                        updateCurrentSelectionState={this.updateCurrentSelectionState}
                        updateCurrentMousePos={this.updateCurrentMousePos}
                        checkCellInside={this.insideSelection}
                    />
                )
            }
            elements.push(
                <div className={"meeting-row"} key={i} style={{
                    gridTemplateColumns: `repeat(${this.MAX_COLS}, 1fr)`
                }}>
                    {cur_row}
                </div>
            )
        }
        return elements;
        // return this.state.current_status.map((elt, idx) => {
        //     return (
        //         <TimeCell key={idx} row={(idx - idx % this.MAX_COLS) / this.MAX_COLS} column={idx % this.MAX_COLS} timestamp={Date.now()}
        //             // status={elt}
        //             getCellSelectedState={this.getCellSelectedState}
        //             updateCurrentSelectionState={this.updateCurrentSelectionState}
        //             updateCurrentMousePos={this.updateCurrentMousePos}
        //             checkCellInside={this.insideSelection}
        //         />)
        // })
    }

    render() {
        return (<div className={"meeting-grid"}
            onMouseUp={this.updateRange}
        >
            {
                this.constructTimeCells()
            }
            <p>{this.state.selectionMode}</p>
            <p>Row: {this.state.row}, Col: {this.state.column}</p>
            <p>Last selection: ({this.state.start_row}, {this.state.start_col}) to ({this.state.end_row}, {this.state.end_col})</p>
        </div>)
    }
}
function MeetingView() {
    return (<div>
        <TimetableGrid />
    </div>);
}

export default MeetingView;