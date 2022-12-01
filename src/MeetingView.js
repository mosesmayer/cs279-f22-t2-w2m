import React, { useState, useEffect, useRef } from 'react';
import { TimetableGrid } from './UserTimeGrid';
import AggregateGrid from './AggregateGrid';
import { GRID_NO_SELECTION, GRID_CELL_UNSELECTED, GRID_CELL_SELECTED, DATES } from './constants.js'
import { maxRows, maxCols } from './constants.js'
import { starting_num_attendees, starting_grid, avail_at_time, unavail_at_time } from './constants.js';
import "./MeetingView.css"

/**
 * Notes
 * w2m makes IDs in the form of YouTime{UnixTimestamp}
 * e.g. YouTime1664975700 refers to a block for Wed Oct 5, 2022, 09:15 GMT-0400 (EDT)
 */



function MeetingView() {

    /**
     * Username Handling
     */
    const [username, setUsername] = useState("Tester");
    const usernameSet = useRef(false);
    const cur_username = useRef(""); // handles input
    const processLogin = () => {
        // console.log("Username recorded: ", cur_username);
        usernameSet.current = true;
        if (cur_username.current !== "") setUsername(cur_username.current);
    }

    function Signin(props) {
        return (<div className={"meeting-grid"}>
            <div className='GridHeader'>
                <div>
                    Sign In
                </div>
                <div style={{ display: 'inline-block', overflow: 'auto', fontSize: '12px', }}>
                    <div>
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <span style={{ fontSize: "0.83em" }}>Your Name: </span>
                                    </td>
                                    <td>
                                        <input style={{ width: "150px" }} placeholder="Name" onChange={e => {
                                            cur_username.current = e.target.value;
                                        }} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <input type="button" value="Sign In" onClick={processLogin} />
                    </div>
                </div>
            </div>
        </div>);
    }

    const base_attendee_status = useRef(
        starting_grid
    );
    const base_attendee_count = useRef(starting_num_attendees);

    const [new_attendee_status, setNewAttendeeStatus] = useState(
        Array(maxRows).fill(
            Array(maxCols).fill(GRID_CELL_UNSELECTED)
        )
    );
    const [avail_status, setAvailStatus] = useState(avail_at_time);
    const [unavail_status, setUnvailStatus] = useState(unavail_at_time);

    const gridChecks = (bef, aft) => {
        const befEmpty = (Math.max(...(bef.map(x => Math.max(...x))))) === 0;
        const aftEmpty = (Math.max(...(aft.map(x => Math.max(...x))))) === 0;
        const new_avail_status = JSON.parse(JSON.stringify(avail_status));
        const new_unavail_status = JSON.parse(JSON.stringify(unavail_status));
        if (befEmpty && !aftEmpty) { // add username to availability
            for (let i = 0; i < maxRows; i++) {
                for (let j = 0; j < maxCols; j++) {
                    if (aft[i][j] !== 0) {
                        new_avail_status[i][j].push(username);
                    } else {
                        new_unavail_status[i][j].push(username);
                    }
                }
            }
        } else if (!befEmpty && aftEmpty) {
            for (let i = 0; i < maxRows; i++) {
                for (let j = 0; j < maxCols; j++) {
                    if (bef[i][j] !== 0) {
                        new_avail_status[i][j].pop();
                    } else {
                        new_unavail_status[i][j].pop();
                    }
                }
            }
        } else if (!befEmpty && !aftEmpty) {
            for (let i = 0; i < maxRows; i++) {
                for (let j = 0; j < maxCols; j++) {
                    if (bef[i][j] === aft[i][j]) continue;
                    if (bef[i][j] === 0) {
                        new_avail_status[i][j].push(username);
                        new_unavail_status[i][j].pop();
                    } else {
                        new_avail_status[i][j].pop();
                        new_unavail_status[i][j].push(username);
                    }
                }
            }
        }
        setAvailStatus(new_avail_status);
        setUnvailStatus(new_unavail_status);
    }

    const updateNewAttendeeCell = (row, column, newval) => {
        const arr = JSON.parse(JSON.stringify(new_attendee_status))
        arr[row][column] = newval;
        setNewAttendeeStatus(arr);
    }

    const getNewAttendeeGrid = () => {
        return new_attendee_status;
    }
    const updateNewAttendeeGrid = (arr) => {
        gridChecks(new_attendee_status, arr);
        setNewAttendeeStatus(arr);
    }

    const getAttendeeCellState = (row, column) => {
        return new_attendee_status[row][column];
    }

    const getAggCellState = (row, column) => {
        return base_attendee_status.current[row][column] + new_attendee_status[row][column];
    }
    const getAttendeeCounts = () => {
        let num_attendees = 0;
        for (let i = 0; i < maxRows; i++) {
            for (let j = 0; j < maxCols; j++) {
                num_attendees = Math.max(num_attendees, base_attendee_status.current[i][j] + new_attendee_status[i][j]);
            }
        }
        const total_attendees = base_attendee_count.current + Math.max(...(new_attendee_status.map(x => Math.max(...x))));
        return { num_attendees, total_attendees };
    }

    const getAllAttendees = () => {
        return { avail_status, unavail_status };
    }

    const getAttendeesAtTime = (row, col) => {
        return { avail: avail_status[row][col], unavail: unavail_status[row][col] };
    }

    console.log(!usernameSet.current);
    return (<div style={{ display: "block", alignContent: "center", padding: "auto" }}>
        {!usernameSet.current ? <Signin /> :
            <TimetableGrid maxRows={maxRows} maxCols={maxCols}
                updCellValue={updateNewAttendeeCell}
                getCellValue={getAttendeeCellState}
                updGridValue={updateNewAttendeeGrid}
                getGridValue={getNewAttendeeGrid}
                username={username}
                dates={DATES}
            />}
        <AggregateGrid maxRows={maxRows} maxCols={maxCols}
            getAttendeeCounts={getAttendeeCounts}
            getCellValue={getAggCellState}
            getAllAttendees={getAllAttendees}
            getAttendeesAtTime={getAttendeesAtTime}
            dates={DATES}
        />
    </div>);
}

export default MeetingView;