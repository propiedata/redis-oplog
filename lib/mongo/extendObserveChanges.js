import { MongoInternals } from 'meteor/mongo';

import observeChanges from './observeChanges';

const MongoCursor = Object.getPrototypeOf(
  MongoInternals.defaultRemoteCollectionDriver().mongo.find()
).constructor;

export default function() {
  MongoInternals.Connection.prototype._observeChanges = observeChanges;
}
