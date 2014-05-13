#include "grid.h"
#include <string.h>
#include <cstdlib>

// Checks if two grids are equal
bool equals(int* grid1, int* grid2)
{
	for(int i = 0; i < 16; i++)
	{
		if (grid1[i] != grid2[i])
		{
			return false;
		}
	}
	return true;
}

// Copies the contents of one grid to the other
void copy(int* grid, int* output)
{
	memcpy(output, grid, sizeof(int) * 16); // To avoid for-loop. Performance gain is controversial.
}

// Shifts up (Apply an upward gravity) to an entire column
void shift_up(int* grid, int column)
{
    int target = 0;
    for(int i = 1; i < 4; i++){
        int targetValue = grid[index(column, target)];
        int currentValue = grid[index(column, i)];
        if (currentValue != 0){
            if (targetValue == 0){
                grid[index(column, target)] = currentValue;
                grid[index(column, i)] = 0;
            }else{
                if (targetValue == currentValue){
                    grid[index(column, i)] = 0;
                    grid[index(column, target)] <<= 1;
                }else{
                    grid[index(column, i)] = 0;
                    grid[index(column, target + 1)] = currentValue;
                }
                target++;
            }
        }
    }
}

// Shifts down (Apply a downwards gravity) to an entire column
void shift_down(int* grid, int column)
{
    int target = 3;
    for(int i = 2; i >= 0; i--){
        int targetValue = grid[index(column, target)];
        int currentValue = grid[index(column, i)];
        if (currentValue != 0){
            if (targetValue == 0){
                grid[index(column, target)] = currentValue;
                grid[index(column, i)] = 0;
            }else{
                if (targetValue == currentValue){
                    grid[index(column, i)] = 0;
                    grid[index(column, target)] <<= 1;
                }else{
                    grid[index(column, i)] = 0;
                    grid[index(column, target - 1)] = currentValue;
                }
                target--;
            }
        }
    }
}

// Shifts left (Apply a leftwards gravity) to an entire row
void shift_left(int* grid, int row)
{
	int target = 0;
    for(int i = 1; i < 4; i++){
        int targetValue = grid[index(target, row)];
        int currentValue = grid[index(i, row)];
        if (currentValue != 0){
            if (targetValue == 0){
                grid[index(target, row)] = currentValue;
                grid[index(i, row)] = 0;
            }else{
                if (targetValue == currentValue){
                    grid[index(i, row)] = 0;
                    grid[index(target, row)] <<= 1;
                }else{
                    grid[index(i, row)] = 0;
                    grid[index(target + 1, row)] = currentValue;
                }
                target++;
            }
        }
    }
}

// Shifts right (Apply a rightwards gravity) to an entire row
void shift_right(int* grid, int row)
{
	int target = 3;
    for(int i = 2; i >= 0; i--){
        int targetValue = grid[index(target, row)];
        int currentValue = grid[index(i, row)];
        if (currentValue != 0){
            if (targetValue == 0){
                grid[index(target, row)] = currentValue;
                grid[index(i, row)] = 0;
            }else{
                if (targetValue == currentValue){
                    grid[index(i, row)] = 0;
                    grid[index(target, row)] <<= 1;
                }else{
                    grid[index(i, row)] = 0;
                    grid[index(target - 1, row)] = currentValue;
                }
                target--;
            }
        }
    }
}

// Moves the entire grid in a direction.
// 0 = up, 1 = right, 2 = down, 3 = left
void move(int* grid, int direction)
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
int gradient(int* grid)
{
    int gradientX = 0;
    int gradientY = 0;

    for(int x = 0; x < 4; x++){
        for(int y = 0; y < 4; y++){
			gradientX += grid[index(x,y)] * (2 * x - 3);
			gradientY += grid[index(x,y)]* (2 * y - 3);
		}
    }

	return abs(gradientX) + abs(gradientY); // Absolute value to equalize both directions
}

// Checks for a dead end
bool has_move(int* grid)
{
	for(int x = 0; x < 4; x++)
	{
		for(int y = 0; y < 4; y++)
		{
			if (grid[index(x, y)] == 0)
				return true;
			if (x < 3 && grid[index(x, y)] == grid[index(x + 1, y)])
				return true;
			if (y < 3 && grid[index(x, y)] == grid[index(x, y+1)])
				return true;
		}
	}
	return false;
}