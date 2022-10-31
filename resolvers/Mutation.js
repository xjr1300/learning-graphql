const { authorizeWithGithub } = require("../lib");

module.exports = {
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
    //console.log(`user: ${JSON.stringify(user)}`);

    // ユーザーとトークンを返却
    return { user, token: access_token };
  },
};