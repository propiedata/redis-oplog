import { _ } from 'meteor/underscore';
import { EJSON } from 'meteor/ejson';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import getFields from '../utils/getFields';
import containsOperators from '../mongo/lib/containsOperators';
import { getRedisPusher } from '../redis/getRedisClient';
import { Events, RedisPipe } from '../constants';

/**
 * call(Mongo.Collection).insert(data)
 * @param channelOrCollection {Mongo.Collection|string}
 */
export default class SyntheticMutator {
  /**
   * @param channels
   * @param data
   */
  static publish(channels, data) {
    const client = getRedisPusher();

    channels.forEach(channel => {
      client.publish(channel, EJSON.stringify(data));
    });
  }

  /**
   * @param channels
   * @param data
   */
  static insert(channels, data) {
    channels = SyntheticMutator._extractChannels(channels);

    if (!data._id) {
      data._id = Random.id();
    }

    SyntheticMutator.publish(channels, {
      [RedisPipe.EVENT]: Events.INSERT,
      [RedisPipe.SYNTHETIC]: true,
      [RedisPipe.DOC]: data,
    });
  }

  /**
   * @param channels
   * @param _id
   * @param modifier
   */
  static update(channels, _id, modifier) {
    channels = SyntheticMutator._extractChannels(channels);

    if (!containsOperators(modifier)) {
      throw new Meteor.Error(
        'Synthetic update can only be done through MongoDB operators.'
      );
    }

    const { topLevelFields } = getFields(modifier);

    let message = {
      [RedisPipe.EVENT]: Events.UPDATE,
      [RedisPipe.SYNTHETIC]: true,
      [RedisPipe.DOC]: { _id },
      [RedisPipe.MODIFIER]: modifier,
      [RedisPipe.MODIFIED_TOP_LEVEL_FIELDS]: topLevelFields,
    };

    SyntheticMutator.publish(channels, message);
  }

  /**
   * @param channels
   * @param _id
   */
  static remove(channels, _id) {
    channels = SyntheticMutator._extractChannels(channels);

    SyntheticMutator.publish(channels, {
      [RedisPipe.EVENT]: Events.REMOVE,
      [RedisPipe.SYNTHETIC]: true,
      [RedisPipe.DOC]: { _id },
    });
  }

  /**
   * @param channels
   * @param _id
   * @returns {*}
   * @private
   */
  static _extractChannels(channels, _id) {
    if (!_.isArray(channels)) {
      if (channels instanceof Mongo.Collection) {
        const name = channels._name;
        channels = [name];
        if (_id) {
          channels.push(`${name}::${_id}`);
        }
      }

      channels = [channels];
    }

    return channels;
  }
}
