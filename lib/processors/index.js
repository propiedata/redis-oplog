import { Strategy } from '../constants';

import getStrategy from './getStrategy';
import directStrategy from './direct';
import defaultStrategy from './default';
import limitSortStrategy from './limit-sort';

const StrategyProcessorMap = {
  [Strategy.LIMIT_SORT]: limitSortStrategy,
  [Strategy.DEFAULT]: defaultStrategy,
  [Strategy.DEDICATED_CHANNELS]: directStrategy
};

export { getStrategy }

/**
 * @param {String} strategy
 * @returns {*}
 */
export function getProcessor(strategy) {
  return StrategyProcessorMap[strategy];
}
