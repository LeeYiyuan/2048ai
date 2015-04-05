#ifndef __STATE_H
#define __STATE_H

#include "matrix.h"

typedef unsigned state_t;

class State : public Matrix<state_t>
{
    public:
        State();
        void move_up();
        void move_right();
        void move_down(); 
        void move_left();
        void move(int direction);
        void spawn();
        state_t compute_sum();
};

#endif
