const { GraphQLScalarType } = require("graphql");
const { ObjectId } = require("mongodb");

module.exports = {
  Photo: {
    id: (parent) => parent.id || parent._id,

    url: (parent) => `/img/photos/${parent._id}.jpg`,

    postedBy: (parent, args, { db }) =>
      db.collection("users").findOne({ githubLogin: parent.userID }),

    taggedUsers: async (parent, args, { db }) => {
      const tags = db.collection("tags").find().toArray();
      const users = tags
        // タグから写真ID(parent.id)と一致するタグを抽出
        .filter((tag) => tag.photoID === parent._id.toString())
        // 抽出したタグからユーザーIDの配列を作成
        .map((tag) => tag.githubLogin);
      // すべてのユーザーから、写真IDが一致する写真を検索して配列に格納
      return db
        .collection("users")
        .find({ githubLogin: { $in: users } })
        .toArray();
    },
  },

  User: {
    postedPhotos: (parent, args, { db }) =>
      db.collection("photos").find({ userID: parent.githubLogin }).toArray(),

    inPhotos: async (parent, args, { db }) => {
      const tags = db.collection("tags").find().toArray();
      const photoIds = tags
        // タグからユーザーID(parent.id)と一致するタグを抽出
        .filter((tag) => tag.githubLogin === parent.githubLogin)
        // 抽出したタグから写真IDの配列を作成
        .map((t) => ObjectId(t.photoID));
      // すべての写真から、写真IDが一致する写真を検索して配列に格納
      return (
        db
          .collection("photos")
          // mongodbはドキュメントごとにユニークな_idフィールドを持つ。
          .find({ _id: { $in: photoIds } })
          .toArray()
      );
    },
  },

  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "A valid date time value.",
    parseValue: (value) => new Date(value),
    serialize: (value) => new Date(value).toISOString(),
    parseLiteral: (ast) => ast.value,
  }),
};
