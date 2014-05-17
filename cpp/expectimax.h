#pragma once
#include <vector>
#include "grid.h"
#include <unordered_map>

typedef std::unordered_map<Grid, double, std::hash<Grid> > Cache;

// Exported function. Call this to compute the best possible move.
// cxy = value of x_th column and y_th row.
extern "C"
{
	int c_best_direction(
		int c00, int c01, int c02, int c03,
		int c10, int c11, int c12, int c13,
		int c20, int c21, int c22, int c23,
		int c30, int c31, int c32, int c33,
		int depth);
}

int best_direction(const Grid& grid, int depth);

// Calculates the best possible move by player
double player_move(const Grid& grid, Cache& cache, int depth);

// Calculates the score, averaged (with weights) over randomly added tiles
double computer_move(const Grid& grid, int depth);