#ifndef __EXPECTIMAX_H
#define __EXPECTIMAX_H

#include "matrix.h"
#include "state.h"
#include "weight.h"

double compute_score(const State& state, const Weight& weight, int depth);
double compute_terminal_score(const State& state, const Weight& weight);

extern "C"
{
	int c_best_direction(
	        int c00, int c10, int c20, int c30,
	        int c01, int c11, int c21, int c31,
	        int c02, int c12, int c22, int c32,
	        int c03, int c13, int c23, int c33,
		int depth);
}

#endif
