#pragma once
#include <stdint.h>
#include "grid.h"

extern "C"
{
void init_move_table();
}
void compute_move(cell_t cells[4]);
void lookup_move(cell_t cells[4]);