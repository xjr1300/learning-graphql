const { ApolloServer } = require(`apollo-server-express`);
const { GraphQLScalarType } = require("graphql");
const expressPlayground =
  require("graphql-playground-middleware-express").default;
const express = require("express");

// スキーマ定義
const typeDefs = `
  scalar DateTime

  # User型
  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  # PhotoCategory列挙型定義
  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  # Photo型定義
  type Photo {
    id: ID!
    url: String!
    name: String!
    category: PhotoCategory!
    description: String
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`;

// cSpell: disable
// 登録済みユーザー
let users = [
  { githubLogin: "mHattrup", name: "Mike Hattrrup" },
  { githubLogin: "gPlake", name: "Glen Plake" },
  { githubLogin: "sSchmidt", name: "Scot Schmidt" },
];
// cSpell: enable

// 投稿された写真に付与するID
let _id = 3;

// cSpell: disable
// 投稿された写真
let photos = [
  {
    id: "1",
    name: "Dropping the Heart Chute",
    description: "The heart chute is one of my favorite chutes",
    category: "ACTION",
    githubUser: "gPlake",
    created: "3-28-1977",
  },
  {
    id: "2",
    name: "Enjoying the sunshine",
    category: "SELFIE",
    githubUser: "sSchmidt",
    created: "2018-04-15T19:09:57+09:00",
  },
  {
    id: "3",
    name: "Gunbarrel 25",
    description: "25 laps on gunbarrel today",
    category: "LANDSCAPE",
    githubUser: "sSchmidt",
    created: "2022-10-28T00:00:00+09:00",
  },
];
// cSpell: enable

// cSpell: disable
// 写真に写っているユーザーを多対多の関係で表現
let tags = [
  { photoID: "1", userID: "gPlake" },
  { photoID: "2", userID: "sSchmidt" },
  { photoID: "2", userID: "mHattrup" },
  { photoID: "2", userID: "gPlake" },
];
// cSpell: enable

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
        ...args.input,
        created: new Date(),
      };
      photos.push(newPhoto);
      // 登録した写真を返却
      return newPhoto;
    },
  },

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

// Expressアプリケーションを作成
let app = express();
// ホーム・ルートを設定
app.get("/", (req, res) => res.end("Welcome to the PhotoShare API"));
// GraphQL Playground用のルートを設定
app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

const startServer = async () => {
  // サーバー・インスタンス構築
  // スキーマとリゾルバを引数で与える。
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();
  // サーバーにExpressミドルウェアを追加
  server.applyMiddleware({ app });
  // サーバーを起動
  app.listen({ port: 4000 }, () =>
    console.log(
      `GraphQL Server running @ http://localhost::4000${server.graphqlPath}`
    )
  );
};
startServer();
