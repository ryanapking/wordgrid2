import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Icon } from 'react-native-elements';

const DrawMoveRating = props => {
  const { rating } = props;

  const fullStars = Math.floor(rating / 2);
  const halfStars = rating % 2;
  const emptyStars = Math.floor((10 - rating) / 2);

  const starArray = [
    ...new Array(fullStars).fill('star'),
    ...new Array(halfStars).fill('star-half'),
    ...new Array(emptyStars).fill('star-outline'),
  ];

  return (
    <View style={styles.mainContainer}>
      { starArray.map( (iconClass, index) =>
        <Icon type='MaterialCommunityIcons' name={iconClass} key={index}/>
      )}
    </View>
  );
};

DrawMoveRating.propTypes = {
  rating: PropTypes.number,
};

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  }
});

export default DrawMoveRating;