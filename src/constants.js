const GRID_NO_SELECTION = -1; // hex color #505050
const GRID_CELL_UNSELECTED = 0; // rgb(255, 222, 222)
const GRID_CELL_SELECTED = 1; // rgb(51, 153, 0)
// grid cell style is 44px by 9px. rgb(255, 222, 222), rgb(51, 153, 0)


const maxRows = 3;
const maxCols = 4;

const starting_num_attendees = 10;
const starting_grid = [];
for (var i = 0; i < maxRows; i++) {
    let tmp = [];
    for (var j = 0; j < maxCols; j++) {
        // starting_grid[i][j] = Math.floor(Math.random() * (starting_num_attendees + 1));
        tmp.push(Math.floor(Math.random() * (starting_num_attendees + 1)));
    }
    starting_grid.push(tmp);
}

export { GRID_NO_SELECTION, GRID_CELL_UNSELECTED, GRID_CELL_SELECTED };
export { maxRows, maxCols };
export { starting_num_attendees, starting_grid };