import React, { useState, useEffect, } from 'react';
import "./MeetingView.css"
import { GRID_NO_SELECTION, GRID_CELL_UNSELECTED, GRID_CELL_SELECTED } from './constants.js'
import { AggregateCell } from './AggregateCell.js'

/**
 * Notes
 * w2m makes IDs in the form of YouTime{UnixTimestamp}
 * e.g. YouTime1664975700 refers to a block for Wed Oct 5, 2022, 09:15 GMT-0400 (EDT)
 */

/**
 * GridHeader functional component
 * @param {*} props 
 * @returns div containing grid header
 */
function GridHeader(props) {
    const [totalAttendees, setTotalAttendees] = useState(props.totalAttendees);
    const [numAttendees, setNumAttendees] = useState(props.numAttendees);
    useEffect(() => {
        setNumAttendees(props.numAttendees);
    }, [props.numAttendees]);
    useEffect(() => {
        setTotalAttendees(props.totalAttendees);
    }, [props.totalAttendees]);

    function GradientCells(props) {
        // rgb(51, 153, 0)
        // ECF6E8, DAECD1, C7E3B9, B5DAA2, A2D18B, 90C774, 7DBE5D, 6BB546, 58AC2E, 46A217, 339900
        // 255, 255, 255
        // 255, 246, 236, 
        const arr = Array(totalAttendees + 1).fill(0);
        const UBND = 0xFFFFFF, LBND = 0x339900;
        for (var i = 0; i <= totalAttendees; i++) {
            const redVal = (((UBND >> 16) - Math.round(((UBND >> 16) - (LBND >> 16)) * i / totalAttendees)) & 0xFF) << 16;
            const greenVal = ((((UBND & 0xFF00) >> 8) - Math.round((((UBND & 0xFF00) >> 8) - ((LBND & 0xFF00) >> 8)) * i / totalAttendees)) & 0xFF) << 8;
            const blueVal = (((UBND & 0xFF) - Math.round(((UBND & 0xFF) - (LBND & 0xFF)) * i / totalAttendees)) & 0xFF);
            // console.log(redVal.toString(16), greenVal.toString(16), blueVal.toString(16))
            arr[i] = redVal | greenVal | blueVal;
        }
        // console.log(arr.map(x => x.toString(16)));
        return arr.map((x, idx) => {
            return (<td style={{ backgroundColor: ("#" + x.toString(16)) }} key={idx}></td>)
        }
        )
    }
    return (
        <div className='GridHeader'>
            <div>
                Group's Availability
            </div>
            <div style={{ display: 'inline-block', overflow: 'auto', fontSize: '12px', }}>
                <div>
                    {0}/{totalAttendees} Available
                    <div style={{ display: 'inline-block', margin: "0px 5px 0px 5px", }}>
                        <table width="100" height="10" cellPadding="0" cellSpacing="0" style={{ border: "solid 1px black" }}>
                            <tbody>
                                <tr>
                                    <GradientCells />
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {totalAttendees}/{totalAttendees} Available
                </div>
                Mouseover the Calendar to see who is available
            </div>
        </div>
    );
}

class AggregateGrid extends React.Component {
    constructor(props) {
        // pass in state from parent as part of props?
        super(props);
        // this.noLaterThan = props.noLaterThan;
        this.MAX_ROWS = props.maxRows;
        this.MAX_COLS = props.maxCols;

        this.state = {
            totalAttendees: props.totalAttendees,
            row: 0,
            column: 0,
            current_status: props.current_status,
            cellbgcolors: -1,
        }
    }

    componentDidMount(props) {
        const arr = Array(this.state.totalAttendees + 1).fill(0);
        const UBND = 0xFFFFFF, LBND = 0x339900;
        for (var i = 0; i <= this.state.totalAttendees; i++) {
            const redVal = (((UBND >> 16) - Math.round(((UBND >> 16) - (LBND >> 16)) * i / this.state.totalAttendees)) & 0xFF) << 16;
            const greenVal = ((((UBND & 0xFF00) >> 8) - Math.round((((UBND & 0xFF00) >> 8) - ((LBND & 0xFF00) >> 8)) * i / this.state.totalAttendees)) & 0xFF) << 8;
            const blueVal = (((UBND & 0xFF) - Math.round(((UBND & 0xFF) - (LBND & 0xFF)) * i / this.state.totalAttendees)) & 0xFF);
            // console.log(redVal.toString(16), greenVal.toString(16), blueVal.toString(16))
            arr[i] = redVal | greenVal | blueVal;
        }
        this.setState({ ...this.state, cellbgcolors: arr })
        this.forceUpdate();
    }

    componentDidUpdate(prevProps) {
        if (this.props.totalAttendees !== prevProps.totalAttendees) {
            // console.log("Component did update", this.state.row, this.state.column)
            this.setState({ ...this.state, totalAttendees: this.props.totalAttendees });
            this.forceUpdate();
        }
    }

    constructTimeCells = () => {
        // console.log("Reconstruct", Date.now());
        console.log(this.state.cellbgcolors);
        if (this.state.cellbgcolors === -1) return;
        console.log("Build cells")
        let elements = [];
        for (var i = 0; i < this.MAX_ROWS; i++) {
            let cur_row = [];
            for (var j = 0; j < this.MAX_COLS; j++) {
                let idx = i * this.MAX_COLS + j;
                let curval = this.props.getCellValue(i, j);
                let cellcolor = this.state.cellbgcolors[curval];
                cur_row.push(
                    <AggregateCell key={idx} row={i} column={j} timestamp={Date.now()}
                        status={curval}
                        style={{ backgroundColor: cellcolor }}
                    // updateCurrentSelectionState={this.updateCurrentSelectionState}
                    // updateCurrentMousePos={this.updateCurrentMousePos}
                    // checkCellInside={this.insideSelection}
                    // activeSelection={this.state.selectionMode}
                    />
                )
            }
            elements.push(
                <div className={"meeting-row"} key={i} style={{
                    // gridTemplateColumns: `repeat(${this.MAX_COLS}, 1fr)`
                }}>
                    {cur_row}
                </div>
            )
        }
        return elements;
    }

    render() {
        return (<div className={"AttendeeHalfPanel"}
        >
            {
                <GridHeader numAttendees={this.props.numAttendees} totalAttendees={this.props.totalAttendees} />
            }
            {this.constructTimeCells()}
        </div>)
    }
}

export default AggregateGrid;