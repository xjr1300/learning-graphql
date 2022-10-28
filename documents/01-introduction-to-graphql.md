# Introduction to GraphQL

> どのように動作して、どのように使用するか、GraphQLについて学びます。
> GraphQLサービスを構築する方法を記載したドキュメントを探していますか?
> [多くの様々な言語](https://graphql.org/code/)でGraphQLを実装することを支援するライブラリが存在します。
> 実践的なチュートリアルで詳細な学習体験を必要とする場合は[How to GraphQL](https://www.howtographql.com/)を参照してください。
> 無償のオンライン・コースは、[Exploring GraphQL: A Query Language for APIs](https://www.edx.org/course/exploring-graphql-a-query-language-for-apis)を確認してください。
>

GraphQLはAPIのためのクエリ言語で、データ用に定義した型システムを使用して、クエリを実行するサーバー側のランタイムです。
GraphQLは特定のデータベースまたはストレージ・エンジンに限定されず、代わりに既存のコードとデータによって支えられています。

GraphQLサービスは型とフィールドの型を定義して、それぞれの型のそれぞれのフィールドに、関数を提供することによって作成されます。
例えば、ログインしたユーザー（自分）とユーザーの名前を伝えるGraphQLサービスは、次のようになります。

```graphql
type Query {
    me: User
}

type User {
    id: ID
    name: String
}
```

それぞれの型のそれぞれのフィールドのための関数は次のようになります。

```javascript
function Query_me(request) {
    return request.auth.user;
}

function User_name(user) {
    return user.getName();
}
```

GraphQLサービスが起動した後（通常はWebサービスのURLで）、GraphQLサービスは検証して実行するために、GraphQLクエリを受け取ることができます。
GraphQLサービスは、最初にクエリを確認して、定義された型とフィールドのみを参照していることを確認してから、提供された関数を実行して結果を生成します。

クエリの例は次です。

```graphql
{
    me {
        name
    }
}
```

次のJSONのような結果を生成するでしょう。

```json
{
    "me": {
        "name": "Luke Skywalker"
    }
}
```
