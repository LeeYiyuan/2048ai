#ifndef __MATRIX_H
#define __MATRIX_H

#include <vector>

template <typename T> 
class Matrix {
    private:
        std::vector<std::vector<T> > mat;
        unsigned rows;
        unsigned cols;

    public:
        Matrix(unsigned _rows, unsigned _cols);
        Matrix(const Matrix<T>& rhs);                                                                                       
        Matrix<T>& operator=(const Matrix<T>& rhs);                                                                                                         
        T& operator()(const unsigned& row, const unsigned& col);
        const T& operator()(const unsigned& row, const unsigned& col) const;    
        bool operator==(const Matrix<T>& rhs) const;       
        bool operator!=(const Matrix<T>& rhs) const;                                                                                          
        unsigned get_rows() const;
        unsigned get_cols() const;
};

#include "matrix.cpp"

#endif
