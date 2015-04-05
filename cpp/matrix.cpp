#ifndef __MATRIX_CPP
#define __MATRIX_CPP

#include "matrix.h"
                                                                                                                                                
template<typename T>
Matrix<T>::Matrix(unsigned _rows, unsigned _cols)
{
    mat.resize(_rows);
    for (unsigned i=0; i<mat.size(); i++)
    {
        mat[i].resize(_cols);
    }
    rows = _rows;
    cols = _cols;
}
                                                                                                                                                       
template<typename T>
Matrix<T>::Matrix(const Matrix<T>& rhs)
{
    mat = rhs.mat;
    rows = rhs.get_rows();
    cols = rhs.get_cols();
}
                                                                                                                                                
template<typename T>
Matrix<T>& Matrix<T>::operator=(const Matrix<T>& rhs)
{
    if (&rhs == this)
        return *this;

    unsigned new_rows = rhs.get_rows();
    unsigned new_cols = rhs.get_cols();

    mat.resize(new_rows);
    for (unsigned i=0; i<mat.size(); i++) 
    {
        mat[i].resize(new_cols);
    }

    for (unsigned i=0; i<new_rows; i++) 
    {
        for (unsigned j=0; j<new_cols; j++) 
        {
          mat[i][j] = rhs(i, j);
        }
    }
    rows = new_rows;
    cols = new_cols;

    return *this;
}
                                                                                                                                          
template<typename T>
T& Matrix<T>::operator()(const unsigned& row, const unsigned& col) 
{
    return this->mat[row][col];
}
                                                                                                                                 
template<typename T>
const T& Matrix<T>::operator()(const unsigned& row, const unsigned& col) const 
{
    return this->mat[row][col];
}

template<typename T>
bool Matrix<T>::operator==(const Matrix<T>& rhs) const
{
    for(unsigned r = 0; r < this->get_rows(); r++)
    {
        for(unsigned c = 0; c < this->get_cols(); c++)
        {
            if ((*this)(r, c) != rhs(r, c))
                return false;
        }
    }
    return true;
}

template<typename T>
bool Matrix<T>::operator!=(const Matrix<T>& rhs) const
{
    return !(*this == rhs);
}
                                                                                                                                 
template<typename T>
unsigned Matrix<T>::get_rows() const 
{
    return this->rows;
}
                                                                                                                                  
template<typename T>
unsigned Matrix<T>::get_cols() const 
{
    return this->cols;
}

#endif
