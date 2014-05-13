#pragma once

// Basic functions
inline int index(int x, int y)
{
	return 4 * x + y;
}
bool equals(int* grid1, int* grid2);
void copy(int* grid, int* output);

// Movements
void shift_up(int* grid, int column);
void shift_down(int* grid, int row);
void shift_left(int* grid, int column);
void shift_right(int* grid, int row);
void move(int* grid, int direction);

// Heuristics
int gradient(int* grid);
bool has_move(int* grid);