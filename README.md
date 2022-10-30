# はじめてのGraphQL

## 5.4.2 コンテキストへのデータベースの追加

`dotenv`をインストールする。

```bash
npm install dotenv
```

`.env`ファイルを作成して、データベース接続情報を追加する。
データベース名を`learning_graphql`とした。

```.env
DB_HOST=mongodb://localhost:27017/learning_graphql
```

`mongodb`を`Docker`で起動する。

```bash
docker-compose up -d
```

`mongodb`の状態を確認する。

```bash
docker-compose exec mongo bash
mongosh admin -u root -p example
admin> db.version()
6.0.2
admin> show dbs
admin   100.00 KiB
config   60.00 KiB
local    72.00 KiB
admin> exit
exit
```

`mongodb`は、`use <database-name>`とするとデータベースが作成される。
しかし、コレクション（テーブル）を作成しないと、`show dbs`でそのデータベースは表示されない。
コレクションを作成後、`show dbs`でデータベースが表示される。

> 本サービスで、明示的にデータベースを作成する必要はない（？）
