const { readFileSync } = require("fs");

const { ApolloServer } = require(`apollo-server-express`);
const expressPlayground =
  require("graphql-playground-middleware-express").default;
const express = require("express");

const { createServer } = require("http");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");

const typeDefs = readFileSync("./typeDefs.graphql", "utf-8");
const resolvers = require("./resolvers");

const { MongoClient } = require("mongodb");
require("dotenv").config();

const start = async () => {
  // Expressアプリケーションを作成
  let app = express();

  // WebSocketを提供するサーバーを構築
  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);

  // データベースと接続
  const { MONGO_HOST, MONGO_PORT, MONGO_DB_NAME } = process.env;
  const mongoUrl = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB_NAME}`;
  const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
  const db = client.db();

  // サーバー・インスタンスを構築して起動
  // スキーマ、リゾルバ及びコンテキストを引数で与える。
  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization;
      const currentUser = await db.collection("users").findOne({ githubToken });
      return { db, currentUser };
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();

  // サーバーにExpressミドルウェアを追加
  server.applyMiddleware({ app });

  // ホーム・ルートを設定
  app.get("/", (req, res) => res.end("Welcome to the PhotoShare API"));
  // GraphQL Playground用のルートを設定
  app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

  // サーバーを起動
  app.listen({ port: 4000 }, () =>
    console.log(
      `GraphQL Server running @ http://localhost::4000${server.graphqlPath}`
    )
  );
};

start();
