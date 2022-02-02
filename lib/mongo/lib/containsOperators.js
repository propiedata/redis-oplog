import { _ } from 'meteor/underscore';

export default function (modifier) {
  return _.some(modifier, function (value, operator) {
    return /^\$/.test(operator);
  });
};
