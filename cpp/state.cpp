#ifndef __STATE_CPP
#define __STATE_CPP

#include "state.h"
#include <cstdlib>

State::State()
    : Matrix<state_t>(4, 4)
{

}

void move_line(state_t cells[4])
{
	int target = 0;
	for (int i = 1; i < 4; i++)
	{
		state_t targetValue = cells[target];
		state_t currentValue = cells[i];
		if (currentValue != 0){
			if (targetValue == 0){
				cells[target] = currentValue;
				cells[i] = 0;
			}
			else{
				if (targetValue == currentValue){
					cells[i] = 0;
					cells[target] <<= 1;
				}
				else{
					cells[i] = 0;
					cells[target + 1] = currentValue;
				}
				target++;
			}
		}
	}
}

void State::move_up()
{
	for (int c = 0; c < 4; c++)
	{
		state_t cells[4];
		for (int r = 0; r < 4; r++)
		{
			cells[r] = (*this)(r, c);
		}
		move_line(cells);
		for (int r = 0; r < 4; r++)
		{
			(*this)(r, c) = cells[r];
		}
	}
}

void State::move_down()
{
	for (int c = 0; c < 4; c++)
	{
		state_t cells[4];
		for (int r = 0; r < 4; r++)
		{
			cells[r] = (*this)(3 - r, c);
		}
		move_line(cells);
		for (int r = 0; r < 4; r++)
		{
			(*this)(3 - r, c) = cells[r];
		}
	}
}

void State::move_left()
{
	for (int r = 0; r < 4; r++)
	{
		state_t cells[4];
		for (int c = 0; c < 4; c++)
		{
			cells[c] = (*this)(r, c);
		}
		move_line(cells);
		for (int c = 0; c < 4; c++)
		{
			(*this)(r, c) = cells[c];
		}
	}
}

void State::move_right()
{
	for (int r = 0; r < 4; r++)
	{
		state_t cells[4];
		for (int c = 0; c < 4; c++)
		{
			cells[c] = (*this)(r, 3 - c);
		}
		move_line(cells);
		for (int c = 0; c < 4; c++)
		{
			(*this)(r, 3 - c) = cells[c];
		}
	}
}

void State::move(int direction)
{
	switch (direction){
	case 0:
		move_up();
		break;
	case 1:
		move_right();
		break;
	case 2:
		move_down();
		break;
	case 3:
		move_left();
		break;
	}
}

void State::spawn()
{
    std::vector<state_t> slots;
    
    for(int r = 0; r < 4; r++)
    {
        for(int c = 0; c < 4; c++)
        {
            if ((*this)(r, c) == 0)
            {
                slots.push_back(r * 4 + c);
            }
        }
    }
    
    int slot = slots[rand() % slots.size()];
    (*this)(slot / 4, slot % 4) = (rand() % 10) == 0 ? 4 : 2;
}

state_t State::compute_sum()
{
    state_t total = 0;
    for(int r = 0; r < 4; r++)
    {
        for(int c = 0; c < 4; c++)
        {
            total += (*this)(r, c);
        }
    }
    return total;
}

#endif
