import React, { useState, useEffect, useRef } from 'react';
import { TimetableGrid } from './UserTimeGrid';
import AggregateGrid from './AggregateGrid';
import { GRID_NO_SELECTION, GRID_CELL_UNSELECTED, GRID_CELL_SELECTED } from './constants.js'
import { maxRows, maxCols } from './constants.js'
import { starting_num_attendees, starting_grid, avail_at_time, unavail_at_time } from './constants.js';
import "./MeetingView.css"

/**
 * Notes
 * w2m makes IDs in the form of YouTime{UnixTimestamp}
 * e.g. YouTime1664975700 refers to a block for Wed Oct 5, 2022, 09:15 GMT-0400 (EDT)
 */



function MeetingView() {
    // const maxRows = 3;
    // const maxCols = 4;


    const base_attendee_status = useRef(
        starting_grid
    );
    const base_attendee_count = useRef(starting_num_attendees);
    console.log("Start: ", base_attendee_status.current, base_attendee_count.current);

    const [new_attendee_status, setNewAttendeeStatus] = useState(
        // const new_attendee_status = useRef(
        Array(maxRows).fill(
            Array(maxCols).fill(GRID_CELL_UNSELECTED)
        )
    );
    const [avail_status, setAvailStatus] = useState(avail_at_time);
    const [unavail_status, setUnvailStatus] = useState(unavail_at_time);
    console.log("Initial state: ", new_attendee_status)
    // console.log("Initial state: ", new_attendee_status, setNewAttendeeStatus)

    const updateNewAttendeeCell = (row, column, newval) => {
        // const arr = JSON.parse(JSON.stringify(new_attendee_status)).current
        const arr = JSON.parse(JSON.stringify(new_attendee_status))
        // console.log("Prev: ", arr, new_attendee_status);
        arr[row][column] = newval;
        // new_attendee_status.current = arr;//[row][column] = newval;
        setNewAttendeeStatus(arr);
        // console.log("New:", arr, "NAS State:", new_attendee_status);
    }

    const getNewAttendeeGrid = () => {
        return new_attendee_status;
    }
    const updateNewAttendeeGrid = (arr) => {
        setNewAttendeeStatus(arr);
    }

    const getAttendeeCellState = (row, column) => {
        // console.log(new_attendee_status);
        // return new_attendee_status.current[row][column];
        return new_attendee_status[row][column];
    }

    const getAggCellState = (row, column) => {
        // return base_attendee_status.current[row][column] + new_attendee_status.current[row][column];
        return base_attendee_status.current[row][column] + new_attendee_status[row][column];
    }
    const getAttendeeCounts = () => {
        let num_attendees = 0;
        for (let i = 0; i < maxRows; i++) {
            for (let j = 0; j < maxCols; j++) {
                num_attendees = Math.max(num_attendees, base_attendee_status.current[i][j] + new_attendee_status[i][j]);
            }
        }
        // const num_attendees = Math.max(...(base_attendee_status.current.map(x => Math.max(...x))));
        // const total_attendees = base_attendee_count.current + Math.max(...(new_attendee_status.current.map(x => Math.max(...x))));
        const total_attendees = base_attendee_count.current + Math.max(...(new_attendee_status.map(x => Math.max(...x))));
        return { num_attendees, total_attendees };
    }

    const getAllAttendees = () => {
        return { avail_status, unavail_status };
    }

    const getAttendeesAtTime = (row, col) => {
        return { avail: avail_status[row][col], unavail: unavail_status[row][col] };
    }

    return (<div style={{ display: "block" }}>
        <TimetableGrid maxRows={maxRows} maxCols={maxCols}
            updCellValue={updateNewAttendeeCell}
            getCellValue={getAttendeeCellState}
            updGridValue={updateNewAttendeeGrid}
            getGridValue={getNewAttendeeGrid}
        />
        <AggregateGrid maxRows={maxRows} maxCols={maxCols}
            // numAttendees={Math.max(...(base_attendee_status.current.map(x => Math.max(...x))))}
            // totalAttendees={base_attendee_count.current + Math.max(...(new_attendee_status.current.map(x => Math.max(...x))))}
            getAttendeeCounts={getAttendeeCounts}
            getCellValue={getAggCellState}
            getAllAttendees={getAllAttendees}
            getAttendeesAtTime={getAttendeesAtTime}
        />
    </div>);
}

export default MeetingView;