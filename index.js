const { ApolloServer } = require(`apollo-server`);

// スキーマ定義
const typeDefs = `
  type Query {
    totalPhotos: Int!
  }

  type Mutation {
    postPhoto(name: String! description: String): Boolean!
  }
`;

// 写真を格納する配列
let photos = [];

// リゾルバ定義
const resolvers = {
  Query: {
    // 写真の数を返却クエリ
    totalPhotos: () => photos.length,
  },

  Mutation: {
    postPhoto(parent, args) {
      photos.push(args);
      return true;
    },
  },
};

// サーバー・インスタンス構築
// スキーマとリゾルバを引数で与える。
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// サーバーを起動
server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
