#pragma once
#include <stdint.h>
#include <string>
#include <vector>

// Type of tile
typedef uint16_t cell_t;

// Grid structure
struct Grid
{
	cell_t cells[16];

	Grid()
	{
		for(int i = 0; i < 16; cells[i] = 0, i++);
	}

	inline bool operator ==(const Grid& grid) const
	{
		return memcmp(cells, grid.cells, 16 * sizeof(cell_t)) == 0;
	}

	inline bool operator !=(const Grid& grid) const
	{
		return !(*this == grid);
	}
};

// Used for hashmap cache
namespace std {
template<>
struct hash<Grid> {
	inline size_t operator()(const Grid& grid) const 
	{
		uint32_t h = 2166136261;
		for(int i = 0; i < 16; i++)
		{
			h ^= grid.cells[i] * 16777619;
		}
		return h;
	}
};
}





// 2D index to 1D index conversion
inline int index(int x, int y)
{
	return 4 * x + y;
}

// Gets the index of some random empty cell
int random_empty_cell(const Grid& grid);





// Gravitates a line. Auxillary function for moving a grid.
void move(cell_t cells[4]);

// Equivalent to pressing the up button.
// Merges are included.
void shift_up(Grid& grid);

// Equivalent to pressing the down button
// Merges are included.
void shift_down(Grid& grid);

// Equivalent to pressing the left button
// Merges are included.
void shift_left(Grid& grid);

// Equivalent to pressing the right button
// Merges are included.
void shift_right(Grid& grid);

// Direction = 0 : shift_up
// Direction = 1 : shift_right
// Direction = 2 : shift_down
// Direction = 3 : shift_left
void move(Grid& grid, int direction);




// Heuristic evaluation function
int evaluate_heuristic(const Grid& grid);

// Checks for dead end
bool has_move(const Grid& grid);

// Gets the highest tile in the grid
cell_t highest(const Grid& grid);