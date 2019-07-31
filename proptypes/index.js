import PropTypes from 'prop-types';

export const rowsType = PropTypes.arrayOf(
  PropTypes.arrayOf(
    PropTypes.string.isRequired
  )
);

export const squaresArrayType = PropTypes.arrayOf(
  PropTypes.shape({
    rowIndex: PropTypes.number.isRequired,
    columnIndex: PropTypes.number.isRequired,
  })
);