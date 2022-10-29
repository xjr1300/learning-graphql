const { GraphQLScalarType } = require("graphql");

module.exports = {
  Photo: {
    url: (parent) => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: (parent) => {
      return users.find((u) => u.githubLogin === parent.githubUser);
    },
    taggedUsers: (parent) =>
      tags
        // タグから写真ID(parent.id)と一致するタグを抽出
        .filter((tag) => tag.photoID === parent.id)
        // 抽出したタグからユーザーIDの配列を作成
        .map((tag) => tag.userID)
        // すべてのユーザーから、写真IDが一致する写真を検索して配列に格納
        .map((userID) => users.find((u) => u.githubLogin === userID)),
  },

  User: {
    postedPhotos: (parent) => {
      return photos.filter((p) => p.githubUser === parent.githubLogin);
    },
    inPhotos: (parent) =>
      tags
        // タグからユーザーID(parent.id)と一致するタグを抽出
        .filter((tag) => tag.userID === parent.id)
        // 抽出したタグから写真IDの配列を作成
        .map((tag) => tag.photoID)
        // すべての写真から、写真IDが一致する写真を検索して配列に格納
        .filter((photoID) => photos.find((p) => p.id == photoID)),
  },

  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "A valid date time value.",
    parseValue: (value) => new Date(value),
    serialize: (value) => new Date(value).toISOString(),
    parseLiteral: (ast) => ast.value,
  }),
};
