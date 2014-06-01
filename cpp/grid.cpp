#include "grid.h"
#include <cstdlib>
#include <stdint.h>
#include <vector>

// Weight matrices used by heuristic evaluation function
static int weight_matrices[2][4][4] = {
		{
			{ 3, 2, 1,  0},
			{ 2, 1, 0,  -1},
			{ 1, 0, -1,  -2},
			{ 0, -1, -2,  -3}
		},
		{
			{ 0, 1, 2, 3},
			{ -1, 0, 1, 2},
			{ -2, -1, 0, 1},
			{ -3, -2, -1, 0}
		}
};

int random_empty_cell(const Grid& grid)
{
	std::vector<int> empty;
	for (int i = 0; i < 16; i++)
	{
		if (grid.cells[i] == 0)
		{
			empty.push_back(i);
		}
	}
	return empty[rand() % empty.size()];
}

void move(cell_t cells[4])
{
	int target = 0;
	for (int i = 1; i < 4; i++)
	{
		cell_t targetValue = cells[target];
		cell_t currentValue = cells[i];
		if (currentValue != 0){
			if (targetValue == 0){
				cells[target] = currentValue;
				cells[i] = 0;
			}
			else{
				if (targetValue == currentValue){
					cells[i] = 0;
					cells[target] <<= 1;
				}
				else{
					cells[i] = 0;
					cells[target + 1] = currentValue;
				}
				target++;
			}
		}
	}
}

void shift_up(Grid& grid)
{
	for (int column = 0; column < 4; column++)
	{
		cell_t cells[4];
		for (int y = 0; y < 4; y++)
		{
			cells[y] = grid.cells[index(column, y)];
		}
		move(cells);
		for (int y = 0; y < 4; y++)
		{
			grid.cells[index(column, y)] = cells[y];
		}
	}
}

void shift_down(Grid& grid)
{
	for (int column = 0; column < 4; column++)
	{
		cell_t cells[4];
		for (int y = 0; y < 4; y++)
		{
			cells[y] = grid.cells[index(column, 3 - y)];
		}
		move(cells);
		for (int y = 0; y < 4; y++)
		{
			grid.cells[index(column, 3 - y)] = cells[y];
		}
	}
}

void shift_left(Grid& grid)
{
	for (int row = 0; row < 4; row++)
	{
		cell_t cells[4];
		for (int x = 0; x < 4; x++)
		{
			cells[x] = grid.cells[index(x, row)];
		}
		move(cells);
		for (int x = 0; x < 4; x++)
		{
			grid.cells[index(x, row)] = cells[x];
		}
	}
}

void shift_right(Grid& grid)
{
	for (int row = 0; row < 4; row++)
	{
		cell_t cells[4];
		for (int x = 0; x < 4; x++)
		{
			cells[x] = grid.cells[index(3 - x, row)];
		}
		move(cells);
		for (int x = 0; x < 4; x++)
		{
			grid.cells[index(3 - x, row)] = cells[x];
		}
	}
}

void move(Grid& grid, int direction)
{
	switch (direction){
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

int evaluate_heuristic(const Grid& grid){
	int best = 0;
	for (int i = 0; i < 2; i++){
		int s = 0;
		for (int y = 0; y < 4; y++)
		{
			for (int x = 0; x < 4; x++)
			{
				s += weight_matrices[i][y][x] * (int)grid.cells[index(x, y)];
			}
		}
		s = abs(s); // Hack for symmetry
		if (s > best)
		{
			best = s;
		}
	}
	return best;
}

bool has_move(const Grid& grid)
{
	for (int x = 0; x < 4; x++)
	{
		for (int y = 0; y < 4; y++)
		{
			if (grid.cells[index(x, y)] == 0)
				return true;
			if (x < 3 && grid.cells[index(x, y)] == grid.cells[index(x + 1, y)])
				return true;
			if (y < 3 && grid.cells[index(x, y)] == grid.cells[index(x, y + 1)])
				return true;
		}
	}
	return false;
}

cell_t highest(const Grid& grid)
{
	int h = 0;
	for (int i = 0; i < 16; i++)
	{
		if (grid.cells[i] > h)
		{
			h = grid.cells[i];
		}
	}
	return h;
}