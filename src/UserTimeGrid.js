import React, { useState, useEffect } from 'react';
import "./MeetingView.css"
import TimeCell from './TimeCell';
import { GRID_NO_SELECTION, GRID_CELL_UNSELECTED, GRID_CELL_SELECTED, START_TIME } from './constants.js'

/**
 * GridHeader functional component
 * @param {*} props 
 * @returns div containing grid header
 */
function GridHeader(props) {
    // const [username, setUsername] = useState(props.username);
    // useEffect(() => {
    //     setUsername(props.username);
    // }, [props.username]);

    return (
        <div className='GridHeader'>
            <div>
                {props.username}'s Availability
            </div>
            <div style={{ display: 'inline-block', overflow: 'auto', fontSize: '12px', }}>
                <div>
                    Unavailable
                    <div style={{ display: 'inline-block', margin: "0px 5px 0px 5px", }}>
                        <table width="30" height="10" cellPadding="0" cellSpacing="0" style={{ border: "solid 1px black" }}>
                            <tbody>
                                <tr>
                                    <td style={{ backgroundColor: "#FFDEDE" }}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    Available
                    <div style={{ display: 'inline-block', margin: "0px 5px 0px 5px", }}>
                        <table width="30" height="10" cellPadding="0" cellSpacing="0" style={{ border: "solid 1px black" }}>
                            <tbody>
                                <tr>
                                    <td style={{ backgroundColor: "#339900" }}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                Click and drag to toggle; saved immediately
            </div>
        </div>
    );
}

class TimetableGrid extends React.Component { // contains TimeCells
    constructor(props) {
        // pass in state from parent as part of props
        super(props);
        console.log(props);
        this.noLaterThan = props.noLaterThan;
        this.MAX_ROWS = props.maxRows;
        this.MAX_COLS = props.maxCols;
        this.username = props.username;
        this.state = {
            selectionMode: GRID_NO_SELECTION,
            row: 0,
            column: 0,
            start_row: -1,
            start_col: -1,
            // current_status: Array(this.MAX_ROWS * this.MAX_COLS).fill(GRID_CELL_UNSELECTED),
        }
    }

    /**
     * Given row and column of child, finds status stored in parent
     * @param {int} row row number of child cell
     * @param {int} col column number of child cell
     * @returns cell status
     */
    getCellSelectedState = (row, col) => {
        return this.props.getCellValue(row, col);
        // return this.state.current_status[row * this.MAX_COLS + col];
    }

    /**
     * On clicking down on a cell to begin selection, update that we are now selecting a range
     * @param {Object} cell_state state of cell that is first selected
     */
    updateCurrentSelectionState = (cell_state) => {
        this.setState({
            ...this.state,
            selectionMode: (GRID_CELL_SELECTED + GRID_CELL_UNSELECTED - cell_state),
            start_row: this.state.row,
            start_col: this.state.column,
        });
    }

    /**
     * On entering a cell, updates the current position of the mouse
     * @param {int} row cell row
     * @param {int} col cell column
     */
    updateCurrentMousePos = (row, col) => {
        this.setState({
            ...this.state, row: row, column: col
        })
    }

    /**
     * UpdateRange: given the current selection, updates the status of selected cells
     *
     * 
     * handle onMouseUp here (do the updating stuff)
     */
    updateRange = () => {
        if (this.state.selectionMode === GRID_NO_SELECTION) return;
        // let new_status = this.state.current_status;

        const printGrid = () => {
            let new_status = [];
            for (var i = 0; i < this.MAX_ROWS; i++) {
                let tmp = [];
                for (var j = 0; j < this.MAX_COLS; j++) {
                    tmp.push(this.props.getCellValue(i, j));
                }
                new_status.push(tmp);
            }
            return new_status;
        }

        console.log("Updating begins: new status: ", printGrid(), "selection mode: ", this.state.selectionMode)
        // for (var i = 0; i < this.MAX_ROWS; i++) {
        //     for (var j = 0; j < this.MAX_COLS; j++) {
        //         if (this.insideSelection(i, j)[0]) {
        //             // console.log("Update", i, j)
        //             // new_status[i * this.MAX_COLS + j] = this.state.selectionMode;
        //             this.props.updCellValue(i, j, this.state.selectionMode);
        //             this.forceUpdate();
        //         }
        //     }
        // }
        let new_grid = JSON.parse(JSON.stringify(this.props.getGridValue())); // deep copy 2d array
        // console.log("Ori new grid:", new_grid);
        for (var i = 0; i < this.MAX_ROWS; i++) {
            for (var j = 0; j < this.MAX_COLS; j++) {
                if (this.insideSelection(i, j)[0]) {
                    new_grid[i][j] = this.state.selectionMode;
                }
            }
        }
        console.log("Candidate new grid:", new_grid);
        this.props.updGridValue(new_grid);
        // console.log("Updating end:", printGrid());

        // console.log("SELECTION MODE", this.state.selectionMode, "NEW STATUS: ", new_status)
        this.setState({
            ...this.state,
            selectionMode: GRID_NO_SELECTION,
            // current_status: new_status,
            start_row: -1,
            start_col: -1,
        })
        console.log(this.state);
        this.forceUpdate();
        console.log("Styles:", document.documentElement.style);
    }

    /**
     * Returns array containing whether current cell is inside selection range
     * @param {int} row 
     * @param {int} col 
     * @returns {[boolean, int]} array, elt1: inside, elt2: current selection state
     */
    insideSelection = (row, col) => {
        const mnrow = Math.min(this.state.start_row, this.state.row);
        const mxrow = Math.max(this.state.start_row, this.state.row);
        const mncol = Math.min(this.state.start_col, this.state.column);
        const mxcol = Math.max(this.state.start_col, this.state.column);
        return [(mnrow <= row && row <= mxrow) && (mncol <= col && col <= mxcol), this.state.selectionMode];
    }

    constructTimeCells = () => {
        // console.log("Reconstruct", Date.now());
        let elements = [];
        for (var i = 0; i < this.MAX_ROWS; i++) {
            let cur_row = [];
            cur_row.push(<div className='meeting-time-cell' key={this.MAX_ROWS * this.MAX_COLS + i}
                style={{
                    textAlign: 'right',
                    fontSize: '10px',
                    paddingRight: '4px',
                    // paddingTop: '4px'
                }}
            >
                {i % 4 === 0 ? `${START_TIME[0] + i / 4}:00` : ""}
            </div>)
            for (var j = 0; j < this.MAX_COLS; j++) {
                let idx = i * this.MAX_COLS + j;
                cur_row.push(
                    <TimeCell key={idx} row={i} column={j} timestamp={Date.now()}
                        status={this.props.getCellValue(i, j)}
                        updateCurrentSelectionState={this.updateCurrentSelectionState}
                        updateCurrentMousePos={this.updateCurrentMousePos}
                        checkCellInside={this.insideSelection}
                        activeSelection={this.state.selectionMode}
                        borderstyle={
                            {
                                borderStyle: `${["solid", "none", "dotted", "none"][i % 4]} ${j === this.MAX_COLS - 1 ? "solid" : "none"} ${i === this.MAX_ROWS - 1 ? "solid" : "none"} solid`,
                                borderWidth: '1px'
                            }
                        }
                    />
                )
            }
            elements.push(
                <div className={"meeting-row"} key={i} style={{
                }}>
                    {cur_row}
                </div>
            )
        }
        // construct last row for final hour
        elements.push(
            <div className={"meeting-row"} key={this.MAX_ROWS} style={{
            }}>
                <div className='meeting-time-cell' key={this.MAX_ROWS * this.MAX_COLS + this.MAX_ROWS}
                    style={{
                        textAlign: 'right',
                        fontSize: '10px',
                        paddingRight: '4px',
                    }}
                >
                    {`${START_TIME[0] + this.MAX_ROWS / 4}:00`}
                </div>
                <div className='meeting-time-cell'
                    style={{
                        width: `${45 * this.MAX_COLS + 1}px`,
                    }}
                >

                </div>
            </div>
        )
        elements.push(<br />)
        return elements;
    }

    constructDateHeaders = () => {
        let elt_row = [];
        elt_row.push(<div className='meeting-time-cell' key={this.MAX_ROWS}
            style={{
                textAlign: 'right',
                fontSize: '10px',
                paddingRight: '4px',
            }}
        ></div>)
        for (let i = 0; i < this.MAX_COLS; i++) {
            elt_row.push(
                <div className='meeting-time-cell' key={this.MAX_ROWS * this.MAX_COLS + i}
                    style={{
                        textAlign: 'center',
                        fontSize: '10px',
                        // paddingRight: '4px',
                        // border: '1px black solid'
                        height: 'auto',
                        width: '45px', // cell width + border size for alignment
                    }}
                >
                    {`${this.props.dates[i][1]} ${this.props.dates[i][2]}`}
                    <br />
                    <span style={{ fontSize: '16px' }}>
                        {this.props.dates[i][0]}
                    </span>
                </div>
            )
        }
        return elt_row;
    }

    render() {
        return (<div className={"meeting-grid"}
            onMouseUp={this.updateRange}
            onMouseLeave={this.updateRange}
        >
            <GridHeader username={this.username} />
            <div className="body-grid">

                <div>
                    {this.constructDateHeaders()}
                </div>
                {
                    this.constructTimeCells()
                }
            </div>
            {/* <p>{this.state.selectionMode}</p>
            <p>Row: {this.state.row}, Col: {this.state.column}</p>
            <p>Last selection: ({this.state.start_row}, {this.state.start_col}) to ({this.state.row}, {this.state.column})</p> */}
        </div>)
    }
}

export { TimetableGrid };