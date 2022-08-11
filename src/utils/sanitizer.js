export default function(doc) {
  doc.id = doc._id.toString();
  return ['createdAt', 'updatedAt', '__v', 'password', '_id'].forEach(key => delete doc[key]);
}