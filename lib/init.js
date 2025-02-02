import deepExtend from 'deep-extend';

import Config from './config';
import reload from './processors/actions/reload';
import PubSubManager from './redis/PubSubManager';
import extendMongoCollection from './mongo/extendMongoCollection';
import RedisSubscriptionManager from './redis/RedisSubscriptionManager';
import { getRedisListener } from './redis/getRedisClient';

let isInitialized = false;

export default (config = {}) => {
  if (isInitialized) {
    throw 'You cannot initialize RedisOplog twice.';
  }

  isInitialized = true;

  deepExtend(Config, config);

  _.extend(Config, {
    isInitialized: true,
    oldPublish: Meteor.publish,
  });

  extendMongoCollection();

  // this initializes the listener singleton with the proper onConnect functionality
  getRedisListener({
    onConnect() {
      // this will be executed initially, but since there won't be any observable collections, nothing will happen
      // PublicationFactory.reloadAll();
      RedisSubscriptionManager.getAllRedisSubscribers().forEach(
        redisSubscriber => {
          reload(redisSubscriber.observableCollection);
        }
      );
    },
  });

  RedisSubscriptionManager.init();
  Config.pubSubManager = new PubSubManager();
};
