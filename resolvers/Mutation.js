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
};
