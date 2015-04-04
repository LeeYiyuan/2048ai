#ifndef __EXPECTIMAX_CPP
#define __EXPECTIMAX_CPP

#include "expectimax.h"
#include <algorithm>

#define SPAWN_COUNT  2

const int SPAWN_TILES[SPAWN_COUNT] = {2, 4};
const double SPAWN_PROBABILITIES[SPAWN_COUNT] = {0.9, 0.1};

double compute_score(const State& state, const Weight& weight, int depth)
{    
    if (depth == 0)
        return compute_terminal_score(state, weight);

    double total_score = 0;
    double total_prob = 0;
    
    for(int r = 0; r < 4; r++)
    {
        for(int c = 0; c < 4; c++)
        {
            if (state(r, c) == 0)
            {
                for(int i = 0; i < 2; i++)
                {
                    State next = state;
                    next(r, c) = SPAWN_TILES[i];
                    
                    double best_score = 0;
                    int best_direction = -1;
                    for(int d = 0; d < 4; d++)
                    {
                        State next_moved = next;
                        next_moved.move(d);
                        if (next_moved != next)
                        {
                            double score = compute_score(next_moved, weight, depth - 1);
                            if (score > best_score)
                            {
                                best_score = score;
                                best_direction = d;
                            }
                        }
                    }
                    if (best_direction != -1)
                    {
                        total_score += SPAWN_PROBABILITIES[i] * best_score;
                    }
                    else
                    {
                        total_score += SPAWN_PROBABILITIES[i] * compute_terminal_score(next, weight);
                    }
                    total_prob += SPAWN_PROBABILITIES[i];
                }
            }
        }
    }
    
    return total_score / total_prob;
}

double compute_terminal_score(const State& state, const Weight& weight)
{
    double score0 = 0, score1 = 0, score2 = 0, score3 = 0;
    double scoret0 = 0, scoret1 = 0, scoret2 = 0, scoret3 = 0;
    
    for(int r = 0; r < 4; r++)
    {
        for(int c = 0; c < 4; c++)
        {
            score0 += state(r, c) * weight(r, c);
            score1 += state(r, c) * weight(3 - c, r);
            score2 += state(r, c) * weight(3 - r, 3 - c);
            score3 += state(r, c) * weight(c, 3 - r);
            
            scoret0 += state(r, c) * weight(c, r);
            scoret1 += state(r, c) * weight(r, 3 - c);
            scoret2 += state(r, c) * weight(3 - c, 3 - r);
            scoret3 += state(r, c) * weight(3 - r, c);
        }
    }
    
    return std::max(
        score0, std::max(
            score1, std::max(
                score2, std::max(
                    score3, std::max(
                        scoret0, std::max(
                            scoret1, std::max(
                                scoret2, scoret3 // I'm sorry
                            )
                        )
                    )
                )
            )
        )
    );
}

//NOTE: Game uses x, y coordinates while we use r, c
int c_best_direction(
	int c00, int c10, int c20, int c30,
	int c01, int c11, int c21, int c31,
	int c02, int c12, int c22, int c32,
	int c03, int c13, int c23, int c33,
	int depth)
{

    static Weight weight;
    weight(0, 0) = 0.135759;    weight(0, 1) = 0.121925;    weight(0, 2) = 0.102812;    weight(0, 3) = 0.099937;
    weight(1, 0) = 0.0997992;   weight(1, 1) = 0.0888405;   weight(1, 2) = 0.076711;    weight(1, 3) = 0.0724143;
    weight(2, 0) = 0.060654;    weight(2, 1) = 0.0562579;   weight(2, 2) = 0.037116;    weight(2, 3) = 0.0161889;
    weight(3, 0) = 0.0125498;   weight(3, 1) = 0.00992495;  weight(3, 2) = 0.00575871;  weight(3, 3) = 0.00335193;

    State state;
	state(0, 0) = c00;
	state(0, 1) = c01;
	state(0, 2) = c02;
	state(0, 3) = c03;
	state(1, 0) = c10;
	state(1, 1) = c11;
	state(1, 2) = c12;
	state(1, 3) = c13;
	state(2, 0) = c20;
	state(2, 1) = c21;
	state(2, 2) = c22;
	state(2, 3) = c23;
	state(3, 0) = c30;
	state(3, 1) = c31;
	state(3, 2) = c32;
	state(3, 3) = c33;
	
	int best_direction = -1;
	double best_score = 0;
	
	for(int d = 0; d < 4; d++)
	{
	    State moved = state;
	    moved.move(d);
	    if (moved != state)
	    {
            double score = compute_score(moved, weight, depth);
            if (score > best_score)
            {
                best_score = score;
                best_direction = d;
            }
        }
	}
	
	return best_direction;
}
#endif
