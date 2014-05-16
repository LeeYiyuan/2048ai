#pragma once
#include <stdint.h>
#include <string>

typedef uint8_t cell_t;

struct Grid
{
	cell_t cells[16];

	inline bool operator ==(const Grid& grid) const
	{
		return memcmp(cells, grid.cells, 16 * sizeof(cell_t)) == 0;
	}

	inline bool operator !=(const Grid& grid) const
	{
		return !(*this == grid);
	}
};

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

// Basic functions
inline int index(int x, int y)
{
	return 4 * x + y;
}

// Movements
void shift_up(Grid& grid);
void shift_down(Grid& grid);
void shift_left(Grid& grid);
void shift_right(Grid& grid);
void move(Grid& grid, int direction);

// Heuristics
int gradient(const Grid& grid);
bool has_move(const Grid& grid);