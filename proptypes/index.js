import PropTypes from 'prop-types';

export const rowsType = PropTypes.arrayOf(
  PropTypes.arrayOf(
    PropTypes.string.isRequired
  )
);

export const rowsArrayType = PropTypes.arrayOf(rowsType);

export const squaresArrayType = PropTypes.arrayOf(
  PropTypes.shape({
    rowIndex: PropTypes.number.isRequired,
    columnIndex: PropTypes.number.isRequired,
    letter: PropTypes.string,
  })
);

export const routeType = PropTypes.shape({
  routeTitle: PropTypes.string,
  backRoute: PropTypes.string,
  path: PropTypes.string,
  componentName: PropTypes.string,
});

export const letterGridType = PropTypes.arrayOf(
  PropTypes.arrayOf(
    PropTypes.string
  )
);