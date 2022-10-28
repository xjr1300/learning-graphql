const { ApolloServer } = require(`apollo-server`);

// スキーマ定義
const typeDefs = `
  type Query {
    totalPhotos: Int!
  }
`;

// リゾルバ定義
const resolvers = {
  Query: {
    totalPhotos: () => 42,
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
