#include "grid.h"
#include <cstdlib>
#include <stdint.h>

// Shifts up (Apply an upward gravity) to an entire column
void shift_up(Grid& grid, int column)
{
    int target = 0;
    for(int i = 1; i < 4; i++){
        cell_t targetValue = grid.cells[index(column, target)];
        cell_t currentValue = grid.cells[index(column, i)];
        if (currentValue != 0){
            if (targetValue == 0){
                grid.cells[index(column, target)] = currentValue;
                grid.cells[index(column, i)] = 0;
            }else{
                if (targetValue == currentValue){
                    grid.cells[index(column, i)] = 0;
                    grid.cells[index(column, target)]++;
                }else{
                    grid.cells[index(column, i)] = 0;
                    grid.cells[index(column, target + 1)] = currentValue;
                }
                target++;
            }
        }
    }
}

// Shifts down (Apply a downwards gravity) to an entire column
void shift_down(Grid& grid, int column)
{
    int target = 3;
    for(int i = 2; i >= 0; i--){
        cell_t targetValue = grid.cells[index(column, target)];
        cell_t currentValue = grid.cells[index(column, i)];
        if (currentValue != 0){
            if (targetValue == 0){
                grid.cells[index(column, target)] = currentValue;
                grid.cells[index(column, i)] = 0;
            }else{
                if (targetValue == currentValue){
                    grid.cells[index(column, i)] = 0;
                    grid.cells[index(column, target)]++;
                }else{
                    grid.cells[index(column, i)] = 0;
                    grid.cells[index(column, target - 1)] = currentValue;
                }
                target--;
            }
        }
    }
}

// Shifts left (Apply a leftwards gravity) to an entire row
void shift_left(Grid& grid, int row)
{
	int target = 0;
    for(int i = 1; i < 4; i++){
        cell_t targetValue = grid.cells[index(target, row)];
        cell_t currentValue = grid.cells[index(i, row)];
        if (currentValue != 0){
            if (targetValue == 0){
                grid.cells[index(target, row)] = currentValue;
                grid.cells[index(i, row)] = 0;
            }else{
                if (targetValue == currentValue){
                    grid.cells[index(i, row)] = 0;
                    grid.cells[index(target, row)]++;
                }else{
                    grid.cells[index(i, row)] = 0;
                    grid.cells[index(target + 1, row)] = currentValue;
                }
                target++;
            }
        }
    }
}

// Shifts right (Apply a rightwards gravity) to an entire row
void shift_right(Grid& grid, int row)
{
	int target = 3;
    for(int i = 2; i >= 0; i--){
        cell_t targetValue = grid.cells[index(target, row)];
        cell_t currentValue = grid.cells[index(i, row)];
        if (currentValue != 0){
            if (targetValue == 0){
                grid.cells[index(target, row)] = currentValue;
                grid.cells[index(i, row)] = 0;
            }else{
                if (targetValue == currentValue){
                    grid.cells[index(i, row)] = 0;
                    grid.cells[index(target, row)]++;
                }else{
                    grid.cells[index(i, row)] = 0;
                    grid.cells[index(target - 1, row)] = currentValue;
                }
                target--;
            }
        }
    }
}

// Moves the entire grid in a direction.
// 0 = up, 1 = right, 2 = down, 3 = left
void move(Grid& grid, int direction)
{
    switch(direction){
        case 0:
            for(int column = 0; column < 4; column++){
				shift_up(grid, column);
            }
            break;
        case 1:
            for(int row = 0; row < 4; row++){
				shift_right(grid, row);
            }
            break;
        case 2:
            for(int column = 0; column < 4; column++){
				shift_down(grid, column);
            }
            break;
        case 3:
            for(int row = 0; row < 4; row++){
				shift_left(grid, row);
            }
            break;
    }
}

// Computes the gradient of a grid
int gradient(const Grid& grid)
{
    int gradientX = 0;
    int gradientY = 0;

    for(int x = 0; x < 4; x++){
        for(int y = 0; y < 4; y++){
			gradientX += grid.cells[index(x,y)] * (2 * x - 3);
			gradientY += grid.cells[index(x,y)]* (2 * y - 3);
		}
    }

	return abs(gradientX) + abs(gradientY); // Absolute value to equalize both directions
}

// Checks for a dead end
bool has_move(const Grid& grid)
{
	for(int x = 0; x < 4; x++)
	{
		for(int y = 0; y < 4; y++)
		{
			if (grid.cells[index(x, y)] == 0)
				return true;
			if (x < 3 && grid.cells[index(x, y)] == grid.cells[index(x + 1, y)])
				return true;
			if (y < 3 && grid.cells[index(x, y)] == grid.cells[index(x, y+1)])
				return true;
		}
	}
	return false;
}