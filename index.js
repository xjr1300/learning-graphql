const { ApolloServer } = require(`apollo-server-express`);
const expressPlayground =
  require("graphql-playground-middleware-express").default;
const express = require("express");
const { readFileSync } = require("fs");

const typeDefs = readFileSync("./typeDefs.graphql", "utf-8");
const resolvers = require("./resolvers");

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
