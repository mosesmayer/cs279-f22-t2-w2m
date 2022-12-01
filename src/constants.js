const GRID_NO_SELECTION = -1; // hex color #505050
const GRID_CELL_UNSELECTED = 0; // rgb(255, 222, 222)
const GRID_CELL_SELECTED = 1; // rgb(51, 153, 0)
// grid cell style is 44px by 9px. rgb(255, 222, 222), rgb(51, 153, 0)


// for fmting purposes, ensure minute is 0. Original W2M only allows by the hour
const START_TIME = [9, 0]; // starting [hour, minute] -> ensure minute is 0
const END_TIME = [17, 0];  // ending [hour, minute]   -> ensure minute is 0
const START_DATE = [2022, 11, 7] // starting [yyyy, mm, dd]
const END_DATE = [2022, 11, 12] // ending [yyyy, mm, dd]


const DATES = [];
const start_date_obj = new Date(START_DATE[0], START_DATE[1] - 1, START_DATE[2]) // Date object month is zero-based indexing, we use one-based above
const end_date_obj = new Date(END_DATE[0], END_DATE[1] - 1, END_DATE[2])
for (let cdate = new Date(start_date_obj.getTime()); cdate <= end_date_obj; cdate.setDate(cdate.getDate() + 1)) {
    DATES.push([cdate.toString().slice(0, 3), cdate.toString().slice(4, 7), cdate.toString().slice(8, 10)]);
}
const maxCols = DATES.length;
const maxRows = (END_TIME[0] - START_TIME[0]) * 4;

const starting_num_attendees = 5; // for testing purposes, ensure <= 10
const starting_grid = [];
for (let i = 0; i < maxRows; i++) {
    let tmp = [];
    for (let j = 0; j < maxCols; j++) {
        tmp.push(0);
    }
    starting_grid.push(tmp);
}

/**
 * Random person generation
 */
// Randomly generated 10 names using https://catonmat.net/tools/generate-random-names
const personNames = ['Celeste Rosales', 'Eileen Gamboa', 'Mariel Person', 'Janell Fleck', 'Loren Cerda', 'Benito Brennan', 'Randy Barbosa', 'Rolando Richardson', 'Rhiannon Baxter', 'Cristina Fierro']
const shuffle_arr = (arr) => {
    // Fisher Yates Shuffle
    for (let i = arr.length - 1, j; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
};
shuffle_arr(personNames);

const weighted_avail_lengths = [0.5, 0.3, 0.1, 0.05, 0.05]; // weighted for 30 min blocks from 30min-150min
for (let i = 1; i < weighted_avail_lengths.length; i++) {
    weighted_avail_lengths[i] += weighted_avail_lengths[i - 1];
}
console.log(weighted_avail_lengths)
let people_avail = {};
let avail_at_time = [];
for (let i = 0; i < maxRows; i++) {
    let tmp = [];
    for (let j = 0; j < maxCols; j++) {
        tmp.push([]);
    }
    avail_at_time.push(tmp);
}
let unavail_at_time = JSON.parse(JSON.stringify(avail_at_time));

for (let k = 0; k < starting_num_attendees; k++) {
    // const person_name = `Person ${k + 1}`;
    const person_name = personNames[k];
    let new_arr = JSON.parse(JSON.stringify(Array(maxRows).fill(Array(maxCols).fill(0))));
    for (let j = 0; j < maxCols; j++) {
        for (let i = 0, ii = 0; ii < maxRows; i = ii) {
            if (Math.random() < 0.2) {
                let len = Math.random();
                ii = i + 2;
                while (ii - i < 10 && len > weighted_avail_lengths[(ii - i) / 2]) ii += 2;
                ii = Math.min(ii, maxRows);
                for (let jj = i; jj < ii; jj++) new_arr[jj][j] = 1;
            }
            ii++;
        }
    }
    for (let i = 0; i < maxRows; i++) {
        for (let j = 0; j < maxCols; j++) {
            starting_grid[i][j] += new_arr[i][j];
            if (new_arr[i][j] > 0) {
                avail_at_time[i][j].push(person_name);
            } else {
                unavail_at_time[i][j].push(person_name);
            }
        }
    }
    console.log(`${person_name}: `, new_arr);
    people_avail[person_name] = new_arr;
}
console.log(people_avail);

// end of random person generation



export { GRID_NO_SELECTION, GRID_CELL_UNSELECTED, GRID_CELL_SELECTED };
export { START_TIME, END_TIME, START_DATE, END_DATE, DATES }
export { maxRows, maxCols };
export { starting_num_attendees, starting_grid, people_avail, avail_at_time, unavail_at_time };