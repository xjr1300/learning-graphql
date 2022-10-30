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
    let { message, accessToken, avatarUrl, login, name } =
      await authorizeWithGithub({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      });
  },
};
