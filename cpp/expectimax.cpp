#include "expectimax.h"
#include "grid.h"
#include <vector>

#define MOVES_COUNT 2

const int MOVES[MOVES_COUNT] = {2, 4}; // Randomly added tiles
const double PROBABILITIES[MOVES_COUNT] = {0.9, 0.1}; // Probabilities of randomly added tiles

// Exported function. Call this to compute the best possible move.
int c_best_direction(
	int c00, int c01, int c02, int c03,
	int c10, int c11, int c12, int c13,
	int c20, int c21, int c22, int c23,
	int c30, int c31, int c32, int c33,
	int depth)
{
	Grid grid;
	grid.cells[index(0, 0)] = c00;
	grid.cells[index(0, 1)] = c01;
	grid.cells[index(0, 2)] = c02;
	grid.cells[index(0, 3)] = c03;
	grid.cells[index(1, 0)] = c10;
	grid.cells[index(1, 1)] = c11;
	grid.cells[index(1, 2)] = c12;
	grid.cells[index(1, 3)] = c13;
	grid.cells[index(2, 0)] = c20;
	grid.cells[index(2, 1)] = c21;
	grid.cells[index(2, 2)] = c22;
	grid.cells[index(2, 3)] = c23;
	grid.cells[index(3, 0)] = c30;
	grid.cells[index(3, 1)] = c31;
	grid.cells[index(3, 2)] = c32;
	grid.cells[index(3, 3)] = c33;
	
    double best_score = 0;
    int best_dir = -1;

    for(int direction = 0; direction < 4; direction++){
		Grid computer_grid = grid;
		move(computer_grid, direction);
		
		if (computer_grid == grid) // No change due to movement
		{
			continue;
		}
		
		double computer_score = computer_move(computer_grid, 2 * depth - 1);
				
        if (computer_score >= best_score){ // Equality : Forces a move even when deadend is expected
            best_score = computer_score;
            best_dir = direction;
        }
    }

	return best_dir;
}

// Calculates the best possible move by player.
double player_move(const Grid& grid, Cache& cache,int depth)
{
	if (depth == 0) // End of branch
	{		
		return has_move(grid) ? gradient(grid) : 0; // has_move(grid) Penalizes dead end
	}

    double best_score = 0;

    for(int direction = 0; direction < 4; direction++){
		Grid computer_grid = grid;
		move(computer_grid, direction);

		if (computer_grid == grid)  // No change due to movement
		{
			continue; // Skip to next direction
		}
		
		double computer_score = 0;

		// Pruning
		Cache::const_iterator iter = cache.find(computer_grid);
		if (iter != cache.end())
		{
			computer_score = iter->second;
		}
		else
		{
			computer_score = computer_move(computer_grid, depth - 1);
			cache[computer_grid] = computer_score;
		}

        if (computer_score > best_score){
            best_score = computer_score;
        }
    }
		
	return best_score;
}

// Calculates the score, averaged (with weights) over randomly added tiles.
double computer_move(const Grid& grid, int depth)
{
	double total_score = 0;
	double total_weight =0;
	
	// Pruning trackers
	Cache cache;
	for(int x = 0; x < 4; x++)
	{
		for(int y = 0; y < 4; y++)
		{
			if (grid.cells[index(x, y)] == 0)
			{
				for(int i = 0; i < MOVES_COUNT; i++)
				{
					Grid player_grid = grid;
					player_grid.cells[index(x, y)] = MOVES[i];

					double score = player_move(player_grid, cache, depth - 1);
					total_score += PROBABILITIES[i] * score; // Weighted average. This is the essence of expectimax.
					total_weight += PROBABILITIES[i]; // Weighted average. This is the essence of expectimax.
				}
			}
		}
	}

	return total_weight == 0 ? 0 : total_score / total_weight;
}