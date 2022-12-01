import React, { useState, useEffect, } from 'react';
import "./MeetingView.css"
import { GRID_NO_SELECTION, GRID_CELL_UNSELECTED, GRID_CELL_SELECTED, START_TIME } from './constants.js'
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
    // const [totalAttendees, setTotalAttendees] = useState(props.totalAttendees);
    // const [numAttendees, setNumAttendees] = useState(props.numAttendees);
    // useEffect(() => {
    //     setNumAttendees(props.numAttendees);
    // }, [props.numAttendees]);
    // useEffect(() => {
    //     setTotalAttendees(props.totalAttendees);
    // }, [props.totalAttendees]);

    let totalAttendees = props.getTotalAttendees();
    let numAttendees = props.getNumAttendees();
    function GradientCells(props) {
        // rgb(51, 153, 0)
        // ECF6E8, DAECD1, C7E3B9, B5DAA2, A2D18B, 90C774, 7DBE5D, 6BB546, 58AC2E, 46A217, 339900
        // 255, 255, 255
        // 255, 246, 236, 
        const arr = Array(numAttendees + 1).fill(0);
        const UBND = 0xFFFFFF, LBND = 0x339900;
        for (let i = 0; i <= numAttendees; i++) {
            const redVal = (((UBND >> 16) - Math.round(((UBND >> 16) - (LBND >> 16)) * i / numAttendees)) & 0xFF) << 16;
            const greenVal = ((((UBND & 0xFF00) >> 8) - Math.round((((UBND & 0xFF00) >> 8) - ((LBND & 0xFF00) >> 8)) * i / numAttendees)) & 0xFF) << 8;
            const blueVal = (((UBND & 0xFF) - Math.round(((UBND & 0xFF) - (LBND & 0xFF)) * i / numAttendees)) & 0xFF);
            // console.log(redVal.toString(16), greenVal.toString(16), blueVal.toString(16))
            arr[i] = redVal | greenVal | blueVal;
        }
        if (totalAttendees === 0) {
            document.documentElement.style.setProperty("--grid-green-0", "#505050");
            return [<td style={{ backgroundColor: "#505050" }} key={0}></td>];
        }
        for (let i = 0; i <= numAttendees; i++) {
            let class_str = `--grid-green-${i}`;
            // console.log(class_str, arr[i].toString(16));
            document.documentElement.style.setProperty(class_str, `#${arr[i].toString(16)}`);
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
                    {numAttendees}/{totalAttendees} Available
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
            // totalAttendees: props.totalAttendees,
            // totalAttendees: props.getAttendeeCounts().total_attendees,
            row: -1,
            column: -1,
            // current_status: props.current_status,
            cellbgcolors: -1,
        }
    }

    componentDidMount(props) {
        const totalAttendees = this.props.getAttendeeCounts().total_attendees;
        const arr = Array(totalAttendees + 1).fill(0);
        const UBND = 0xFFFFFF, LBND = 0x339900;
        for (var i = 0; i <= totalAttendees; i++) {
            const redVal = (((UBND >> 16) - Math.round(((UBND >> 16) - (LBND >> 16)) * i / totalAttendees)) & 0xFF) << 16;
            const greenVal = ((((UBND & 0xFF00) >> 8) - Math.round((((UBND & 0xFF00) >> 8) - ((LBND & 0xFF00) >> 8)) * i / totalAttendees)) & 0xFF) << 8;
            const blueVal = (((UBND & 0xFF) - Math.round(((UBND & 0xFF) - (LBND & 0xFF)) * i / totalAttendees)) & 0xFF);
            // console.log(redVal.toString(16), greenVal.toString(16), blueVal.toString(16))
            arr[i] = redVal | greenVal | blueVal;
        }
        this.setState({ ...this.state, cellbgcolors: arr })
        this.forceUpdate();
    }

    componentDidUpdate(prevProps) {
        if (this.state.totalAttendees !== this.props.getAttendeeCounts().total_attendees) {
            this.setState({ ...this.state, totalAttendees: this.props.getAttendeeCounts().total_attendees });
            this.forceUpdate();
        }
        // if (this.props.totalAttendees !== prevProps.totalAttendees) {
        //     // console.log("Component did update", this.state.row, this.state.column)
        //     this.setState({ ...this.state, totalAttendees: this.props.totalAttendees });
        //     this.forceUpdate();
        // }
    }

    updateCurrentMousePos = (row, column) => {
        this.setState({ ...this.state, row, column });
    }

    constructTimeCells = () => {
        // console.log("Reconstruct", Date.now());
        // console.log(this.state.cellbgcolors);
        // if (this.state.cellbgcolors === -1) return;
        // console.log("Build cells")
        let elements = [];
        for (var i = 0; i < this.MAX_ROWS; i++) {
            let cur_row = [];
            cur_row.push(<div className='meeting-time-cell' key={2 * this.MAX_ROWS * this.MAX_COLS + i}
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
                let curval = this.props.getCellValue(i, j);
                // let cellcolor = this.state.cellbgcolors[curval];
                cur_row.push(
                    <AggregateCell key={idx} row={i} column={j} timestamp={Date.now()}
                        status={curval}
                        // style={{ backgroundColor: cellcolor }}
                        // updateCurrentSelectionState={this.updateCurrentSelectionState}
                        updateCurrentMousePos={this.updateCurrentMousePos}
                        // checkCellInside={this.insideSelection}
                        // activeSelection={this.state.selectionMode}
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

    constructAvailability = () => {
        if (this.state.row < 0) return <p></p>;
        // console.log("calling with params ", this.state.row, this.state.column)
        const other_guest_status = this.props.getAttendeesAtTime(this.state.row, this.state.column);
        const elt = (<div style={{ display: 'block', margin: "auto", gap: "20px" }}>
            <div style={{ display: 'inline-block', verticalAlign: "top", margin: "5px", padding: "3px" }}>
                <h4 style={{ margin: "0px" }}>Available:</h4>
                {other_guest_status.avail.map((x, i) => (<div key={i}><span style={{ fontSize: "0.83em" }}>{x}</span></div>))}
            </div>
            <div style={{ display: 'inline-block', verticalAlign: "top", margin: "5px", padding: "3px" }}>
                <h4 style={{ margin: "0px" }}>Not Available:</h4>
                {other_guest_status.unavail.map((x, i) => (<div key={i}><span style={{ fontSize: "0.83em" }}>{x}</span></div>))}
            </div>
        </div>);
        return elt;
        // console.log(this.props.getAttendeesAtTime(this.state.row, this.state.column).avail)
        // return <p>{this.props.getAttendeesAtTime(this.state.row, this.state.column).avail}</p>
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
        return (<div className={"AttendeeHalfPanel"}
        >
            {
                <GridHeader getNumAttendees={() => { return this.props.getAttendeeCounts().num_attendees }}
                    getTotalAttendees={() => { return this.props.getAttendeeCounts().total_attendees }} />
            }
            <div className="body-grid">

                <div>
                    {this.constructDateHeaders()}
                </div>
                <div onMouseLeave={() => { this.updateCurrentMousePos(-1, -1) }}>
                    {this.constructTimeCells()}
                </div>
            </div>
            {/* <p>{this.state.totalAttendees}</p> */}
            {this.constructAvailability()}
        </div>)
    }
}

export default AggregateGrid;