import React, { useEffect, useReducer } from 'react';
import { useDispatch } from 'react-redux';

import { setErrorMessage } from "../data/redux/messages";

const initialState = {
  parseObject: null,
  fetching: false,
};

const reducer = (state, action) => {
  switch(action.type) {
    case 'fetching':
      return {...state, fetching: true};
    case 'fetchingComplete':
      return {...state, fetching: false};
    case 'setObject':
      return {...state, fetching: false, parseObject: action.parseObject};
    default:
      return {...state};
  }
};

/**
 * Takes a parse function, returns the value and fetching status. Throws an error using redux if needed.
 *
 * @param {function} parseFunction - parse fetcher function to run
 * @param {Object} functionParams - Should match param requirements for provided parseFunction
 * @param {boolean} [isGenerator=false] - is the provided function a generator function
 *
 * @returns {[null|Object|Array, Boolean, Function]}
 */
export const useParseFetcher = (parseFunction, functionParams, isGenerator = false) => {
  const [state, localDispatch] = useReducer(reducer, initialState);
  const reduxDispatch = useDispatch();

  const fetchObject = async () => {
    localDispatch({type: "fetching"});
    const parseObject = await parseFunction(functionParams)
      .catch((err) => {
        localDispatch({type: "fetchingComplete"});
        reduxDispatch(setErrorMessage(err));
      });
    localDispatch({type: "setObject", parseObject});
  };

  const fetchGenerator = async () => {
    const generator = parseFunction(functionParams);
    let valuesRemain = true;
    while (valuesRemain) {
      localDispatch({type: "fetching"});
      const { value, done } = await generator.next();
      if (done) valuesRemain = false;
      else localDispatch({type: "setObject", parseObject: value});
    }
  };

  useEffect(() => {
    if (isGenerator) fetchGenerator().then();
    else fetchObject().then();
  }, []);

  return [state.parseObject, state.fetching, fetchObject];
};