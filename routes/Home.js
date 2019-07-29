import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'react-router-native';

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>

        {/*<View style={styles.triangleCorner}></View>*/}
        {/*<View style={styles.triangleCornerLayer}></View>*/}
        {/*<View style={styles.triangleCorner1}></View>*/}

        <View style={styles.ryan} />
        <Redirect to="/games" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  ryan: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'gray',
    // transform: [{rotate: '-45deg'}]
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
    backgroundColor: '#ecf0f1',
  },
  triangleCorner: {
    position: 'absolute',
    top:105,
    left:0,
    width: 300,
    height: 100,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 50,
    borderTopWidth: 80,
    borderRightColor: 'transparent',
    borderTopColor: 'gray'
  },
  triangleCorner1: {
    position: 'absolute',
    top:100,
    left:0,
    width: 130,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 50,
    borderTopWidth: 90,
    borderRightColor: 'transparent',
    borderTopColor: 'green'
  },
  triangleCornerLayer: {
    position: 'absolute',
    top:107,
    left:0,
    width:297,
    height: 100,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 47,
    borderTopWidth: 75,
    borderRightColor: 'transparent',
    borderTopColor: 'white'
  },
});