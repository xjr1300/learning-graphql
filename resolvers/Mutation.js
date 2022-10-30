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
    let { message, accessToken, avatarUrl, login, name } =
      await authorizeWithGithub({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      });

    // メッセージがある場合は、何らかのエラーが発生している
    if (message) {
      throw new Error(message);
    }

    // データをオブジェクトにまとめる
    let latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: accessToken,
      avatar: avatarUrl,
    };

    // 認証に成功したユーザーの情報をデータベースに記録
    const {
      ops: [user],
    } = await db
      .collection("users")
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

    // ユーザーとトークンを返却
    return { user, token: accessToken };
  },
};
