const { authorizeWithGithub } = require("../lib");
const { uploadStream } = require("../lib");
const path = require("path");

module.exports = {
  async postPhoto(parent, args, { db, currentUser, pubsub }) {
    // コンテキストにユーザーが設定されていない場合はエラーをスロー
    if (!currentUser) {
      throw new Error("only an authenticated user can post a photo");
    }

    // ユーザーのIDと写真を保存
    let newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date(),
    };

    // データベースに写真を登録して、データベースが生成したIDを取得
    // mongodbは登録したドキュメント（この場合は写真）ごとに固有の識別子を作成する。
    // db.collection.create()メソッドは、作成した識別子を配列で返却する。
    // db.collection.create()メソッドは、登録するドキュメントの配列を受け付ける。
    // mongodbはドキュメントごとにユニークな_idフィールドを持つ。
    // const { insertedIds } = await db.collection("photos").insert(newPhoto);
    const { insertedId } = await db.collection("photos").insertOne(newPhoto);
    newPhoto.id = insertedId;

    const toPath = path.join(
      __dirname,
      "..",
      "assets",
      "photos",
      `${newPhoto.id}.jpg`
    );

    const { stream } = await args.input.file;
    await uploadStream(stream, toPath);

    pubsub.publish("photo-added", { newPhoto });

    // 登録した写真を返却
    return newPhoto;
  },

  async githubAuth(parent, { code }, { db }) {
    // GitHubからユーザー・プロファイルを取得
    let { message, access_token, avatar_url, login, name } =
      await authorizeWithGithub({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      });

    // メッセージがある場合は、何らかのエラーが発生している
    if (message) {
      throw new Error(message);
    }

    // console.log(`message: ${message}`);
    // console.log(`access_token: ${access_token}`);
    // console.log(`avatar_url: ${avatar_url}`);
    // console.log(`login: ${login}`);
    // console.log(`name: ${name}`);

    // データをオブジェクトにまとめる
    const latestUserInfo = {
      githubLogin: login,
      name,
      avatar: avatar_url,
      githubToken: access_token,
    };

    // 認証に成功したユーザーの情報をデータベースに記録
    // db.collection.replaceOne(filter, replacement, options)
    // 書籍が想定する戻り値とは、現在異なっている。
    // const { ops: [user] } = await db
    const ops = await db
      .collection("users")
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });
    // console.log(`ops: ${JSON.stringify(ops)}`);
    const { _token, ...user } = latestUserInfo;
    // console.log(`user: ${JSON.stringify(user)}`);

    // ユーザーとトークンを返却
    return { user, token: access_token };
  },

  async addFakeUsers(parent, { count }, { db }) {
    const randomUserApi = `https://randomuser.me/api/?results=${count}`;
    var { results } = await fetch(randomUserApi).then((res) => res.json());
    var users = results.map((r) => ({
      githubLogin: r.login.username,
      name: `${r.name.first} ${r.name.last}`,
      avatar: r.picture.thumbnail,
      githubToken: r.login.sha1,
    }));
    await db.collection("users").insertMany(users);

    return users;
  },

  async fakeUserAuth(parent, { githubLogin }, { db }) {
    var user = await db.collection("users").findOne({ githubLogin });
    if (!user) {
      throw new Error(`Cannot find user with githubLogin "${githubLogin}`);
    }

    return {
      token: user.githubToken,
      user,
    };
  },
};
