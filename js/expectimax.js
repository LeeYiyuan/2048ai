function bestMove(log_grid)
{
    // Calls up function from emscripten-compiled c_expectimax.js
    var c_best_direction = Module.cwrap('c_best_direction', 'number', ['number','number','number','number','number','number','number','number','number','number','number','number','number','number','number']);
    return c_best_direction(
        log_grid[0][0], log_grid[0][1], log_grid[0][2], log_grid[0][3],
        log_grid[1][0], log_grid[1][1], log_grid[1][2], log_grid[1][3],
        log_grid[2][0], log_grid[2][1], log_grid[2][2], log_grid[2][3],
        log_grid[3][0], log_grid[3][1], log_grid[3][2], log_grid[3][3],
	4);
}

function initMoveTable()
{
    var init_move_table = Module.cwrap('init_move_table');
    init_move_table();
}