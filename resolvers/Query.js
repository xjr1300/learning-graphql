module.exports = {
  // 登録されている写真の数を返却
  totalPhotos: (parent, args, { db }) =>
    db.collection("photos").estimatedDocumentCount(),

  // 登録されているすべての写真を返却
  allPhotos: (parent, args, { db }) => db.collection("photos").find().toArray(),

  // 登録されているユーザーの数を返却
  totalUsers: (parent, args, { db }) =>
    db.collection("users").estimatedDocumentCount(),

  // 登録されているすべてのユーザーを返却
  allUsers: (parent, args, { db }) => db.collection("users").find().toArray(),
};
