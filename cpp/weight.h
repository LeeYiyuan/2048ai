#ifndef __WEIGHT_H
#define __WEIGHT_H

#include "matrix.h"

typedef double weight_t;

class Weight : public Matrix<weight_t>
{
    public:
        Weight();
};

#endif
