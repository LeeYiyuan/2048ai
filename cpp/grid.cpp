#include "grid.h"
#include <cstdlib>
#include <stdint.h>
#include <vector>

void move(cell_t cells[4])
{
	int target = 0;
    for(int i = 1; i < 4; i++){
        cell_t targetValue = cells[target];
        cell_t currentValue = cells[i];
        if (currentValue != 0){
            if (targetValue == 0){
				cells[target] = currentValue;
				cells[i] = 0;
            }else{
                if (targetValue == currentValue){
					cells[i] = 0;
					cells[target] <<= 1;
                }else{
					cells[i] = 0;
					cells[target + 1] = currentValue;
                }
                target++;
            }
        }
    }
}

// Shifts the entire grid upwards
void shift_up(Grid& grid)
{
	for(int column = 0; column < 4; column++)
	{
		cell_t cells[4];
		for(int y = 0; y < 4; y++)
		{
			cells[y] = grid.cells[index(column, y)];
		}
		move(cells);
		for(int y = 0; y < 4; y++)
		{
			grid.cells[index(column, y)] = cells[y];
		}
	}
}

// Shifts the entire grid downwards
void shift_down(Grid& grid)
{
	for(int column = 0; column < 4; column++)
	{
		cell_t cells[4];
		for(int y = 0; y < 4; y++)
		{
			cells[y] = grid.cells[index(column, 3 - y)];
		}
		move(cells);
		for(int y = 0; y < 4; y++)
		{
			grid.cells[index(column, 3 - y)] = cells[y];
		}
	}
}

// Shifts the entiregrid leftwards
void shift_left(Grid& grid)
{
	for(int row = 0; row < 4; row++)
	{
		cell_t cells[4];
		for(int x = 0; x < 4; x++)
		{
			cells[x] = grid.cells[index(x, row)];
		}
		move(cells);
		for(int x = 0; x < 4; x++)
		{
			grid.cells[index(x, row)] = cells[x];
		}
	}
}

// Shifts the entire grid rightwards
void shift_right(Grid& grid)
{
	for(int row = 0; row < 4; row++)
	{
		cell_t cells[4];
		for(int x = 0; x < 4; x++)
		{
			cells[x] = grid.cells[index(3 - x, row)];
		}
		move(cells);
		for(int x = 0; x < 4; x++)
		{
			grid.cells[index(3 - x, row)] = cells[x];
		}
	}
}

// Moves the entire grid in a direction.
// 0 = up, 1 = right, 2 = down, 3 = left
void move(Grid& grid, int direction)
{
    switch(direction){
        case 0:
			shift_up(grid);
            break;
        case 1:
			shift_right(grid);
            break;
        case 2:
			shift_down(grid);
            break;
        case 3:
			shift_left(grid);
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
			int value = grid.cells[index(x,y)];
			gradientX += value * (2 * x - 3);
			gradientY += value * (2 * y - 3);
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

void get_empty_cells(std::vector<int>& output, const Grid& grid)
{
	for(int i = 0; i < 16; i++)
	{
		if (grid.cells[i] == 0)
		{
			output.push_back(i);
		}
	}
}

cell_t highest(const Grid& grid)
{
	int h = 0;
	for(int i = 0; i < 16; i++)
	{
		if (grid.cells[i] > h)
		{
			h = grid.cells[i];
		}
	}
	return h;
}