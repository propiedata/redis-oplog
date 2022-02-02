import { _ } from 'meteor/underscore';

export default function extractIdsFromSelector(selector) {
  let ids = [];
  const filter = selector._id;

  if (_.isObject(filter) && !filter._str) {
    if (!filter.$in) {
      throw new Meteor.Error(
        `When you subscribe directly, you can't have other specified fields rather than $in`
      );
    }

    ids = filter.$in;
  } else {
    ids.push(filter);
  }

  return ids;
}
