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
	int grid[16];
	grid[index(0, 0)] = c00;
	grid[index(0, 1)] = c01;
	grid[index(0, 2)] = c02;
	grid[index(0, 3)] = c03;
	grid[index(1, 0)] = c10;
	grid[index(1, 1)] = c11;
	grid[index(1, 2)] = c12;
	grid[index(1, 3)] = c13;
	grid[index(2, 0)] = c20;
	grid[index(2, 1)] = c21;
	grid[index(2, 2)] = c22;
	grid[index(2, 3)] = c23;
	grid[index(3, 0)] = c30;
	grid[index(3, 1)] = c31;
	grid[index(3, 2)] = c32;
	grid[index(3, 3)] = c33;
	
    double best_score = 0;
    int best_dir = -1;

    for(int direction = 0; direction < 4; direction++){
		int computer_grid[16];
		copy(grid, computer_grid);
		move(computer_grid, direction);

		if (equals(computer_grid, grid)) // No change due to movement
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
double player_move(int* grid, std::vector<int*>& computed_grids, std::vector<double>& computed_scores,int depth)
{
	if (depth == 0) // End of branch
	{		
		return has_move(grid) ? gradient(grid) : 0; // has_move(grid) Penalizes dead end
	}

    double best_score = 0;

    for(int direction = 0; direction < 4; direction++){
		int* computer_grid = new int[16];
		copy(grid, computer_grid);
		move(computer_grid, direction);

		if (equals(computer_grid, grid))  // No change due to movement
		{
			delete[] computer_grid;
			continue; // Skip to next direction
		}
		
		double computer_score = 0;

		// Pruning
		bool was_computed = false;
		for(int i = 0; i < computed_grids.size() && !was_computed; i++)
		{
			if (equals(computed_grids.at(i), computer_grid)) // Branch was previously calculated
			{
				computer_score = computed_scores.at(i);
				was_computed = true;
				delete[] computer_grid;
			}
		}
		
		if (!was_computed) // New branch found
		{
			computer_score = computer_move(computer_grid, depth - 1);
			
			// Add branch to prunes (I don't think "prunes" is the correct term, but anyway...)
			computed_grids.push_back(computer_grid);
			computed_scores.push_back(computer_score);
		}

        if (computer_score > best_score){
            best_score = computer_score;
        }
    }
		
	return best_score;
}

// Calculates the score, averaged (with weights) over randomly added tiles.
double computer_move(int* grid, int depth)
{
	double total_score = 0;
	double total_weight =0;
	
	// Pruning trackers
	std::vector<int*> next_computed_grids;
	std::vector<double> next_computed_scores;

	for(int x = 0; x < 4; x++)
	{
		for(int y = 0; y < 4; y++)
		{
			if (grid[index(x, y)] == 0)
			{
				for(int i = 0; i < MOVES_COUNT; i++)
				{
					int player_grid[16];
					copy(grid, player_grid);
					player_grid[index(x, y)] = MOVES[i];

					double score = player_move(player_grid, next_computed_grids, next_computed_scores, depth - 1);
					total_score += PROBABILITIES[i] * score; // Weighted average. This is the essence of expectimax.
					total_weight += PROBABILITIES[i]; // Weighted average. This is the essence of expectimax.
				}
			}
		}
	}

	for(int i = 0; i < next_computed_grids.size(); i++)
	{
		delete[] next_computed_grids.at(i); // Deletes all pruned branches score
	}

	return total_weight == 0 ? 0 : total_score / total_weight;
}