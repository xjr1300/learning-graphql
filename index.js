const { ApolloServer } = require(`apollo-server`);

// スキーマ定義
const typeDefs = `
  # Photo型定義
  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(name: String! description: String): Photo!
  }
`;

// 投稿された写真に付与するID
let _id = 0;
// 写真を格納する配列
let photos = [];

// リゾルバ定義
const resolvers = {
  Query: {
    // 写真の数を返却するクエリ
    totalPhotos: () => photos.length,
    // 登録されているすべての写真を返却するクエリ
    allPhotos: () => photos,
  },

  Mutation: {
    postPhoto(parent, args) {
      // IDを裁判して写真インスタンスを構築して、配列に登録
      let newPhoto = {
        id: ++_id,
        ...args,
      };
      photos.push(newPhoto);
      // 登録した写真を返却
      return newPhoto;
    },
  },

  Photo: {
    url: (parent) => `http://yooursite.com/img/${parent.id}.jpg`,
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
