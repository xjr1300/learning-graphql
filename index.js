const { readFileSync } = require("fs");

const { ApolloServer } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const express = require("express");
const expressPlayground =
  require("graphql-playground-middleware-express").default;
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { useServer } = require("graphql-ws/lib/use/ws");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { MongoClient } = require("mongodb");

const typeDefs = readFileSync("./typeDefs.graphql", "utf-8");
const resolvers = require("./resolvers");

require("dotenv").config();

const start = async () => {
  // データベースと接続
  const { MONGO_HOST, MONGO_PORT, MONGO_DB_NAME } = process.env;
  const mongoUrl = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB_NAME}`; // Expressアプリケーションを作成
  const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
  const db = client.db();

  // WebSocketを提供するサーバーを構築
  let app = express();
  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);

  // サーバー・インスタンスを構築して起動
  // スキーマ、リゾルバ及びコンテキストを引数で与える。
  const pubsub = new PubSub();
  const server = new ApolloServer({
    schema,
    context: async ({ req, connection }) => {
      const githubToken = req
        ? req.headers.authorization
        : connection.context.Authorization;
      const currentUser = await db.collection("users").findOne({ githubToken });
      return { db, currentUser, pubsub };
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
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
  server.applyMiddleware({ app });

  // ホーム・ルートを設定
  app.get("/", (req, res) => res.end("Welcome to the PhotoShare API"));
  // GraphQL Playground用のルートを設定
  app.use(
    "/playground",
    expressPlayground({
      endpoint: "/graphql",
      subscriptionEndpoint: "ws://localhost:4000/graphql",
    })
  );

  // サーバーを起動
  app.listen({ port: 4000 }, () =>
    console.log(
      `GraphQL Server running at http://localhost::4000${server.graphqlPath}`
    )
  );
};

start();
