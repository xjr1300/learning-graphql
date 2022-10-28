const { ApolloServer } = require(`apollo-server`);

// スキーマ定義
const typeDefs = `
  # User型
  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
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
  },
  {
    id: "2",
    name: "Enjoying the sunshine",
    category: "SELFIE",
    githubUser: "sSchmidt",
  },
  {
    id: "3",
    name: "Gunbarrel 25",
    description: "25 laps on gunbarrel today",
    category: "LANDSCAPE",
    githubUser: "sSchmidt",
  },
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
      };
      photos.push(newPhoto);
      // 登録した写真を返却
      return newPhoto;
    },
  },

  Photo: {
    url: (parent) => `http://yooursite.com/img/${parent.id}.jpg`,
    postedBy: (parent) => {
      return users.find((u) => u.githubLogin === parent.githubUser);
    },
  },

  User: {
    postedPhotos: (parent) => {
      return photos.filter((p) => p.githubUser === parent.githubLogin);
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
