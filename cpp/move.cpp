#include "move.h"
#include "grid.h"

static cell_t move_table[16][16][16][16][4];

void init_move_table()
{  
	for(int i = 0; i < (1 << 16); i++)
	{
		cell_t c0 = i & 15;
		cell_t c1 = (i >> 4) & 15;
		cell_t c2 = (i >> 8) & 15;
		cell_t c3 = (i >> 12) & 15;
		cell_t arr[] = {c0, c1, c2, c3};
		compute_move(arr);
		for(int j = 0; j < 4; j++)
		{
			move_table[c0][c1][c2][c3][j] = arr[j];
		}
	}
	printf("Move tables initialized.\n");
}

void compute_move(cell_t cells[4])
{
	int target = 0;
    for(int i = 1; i < 4; i++){
        cell_t targetValue = cells[target];
        cell_t currentValue = cells[i];
        if (currentValue != 0){
            if (targetValue == 0){
				cells[target] = currentValue;
				cells[i] = 0;
            }else{
                if (targetValue == currentValue){
					cells[i] = 0;
					cells[target]++;
                }else{
					cells[i] = 0;
					cells[target + 1] = currentValue;
                }
                target++;
            }
        }
    }
}

void lookup_move(cell_t cells[4])
{
	cell_t* result = move_table[cells[0]][cells[1]][cells[2]][cells[3]];
	for(int i = 0; i < 4; i++)
	{
		cells[i] = result[i];
	}
}