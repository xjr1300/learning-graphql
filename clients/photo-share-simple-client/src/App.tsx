import { FC, useEffect, useState } from 'react';
import { request } from 'graphql-request';

import Users, { User } from 'Users';

const title = import.meta.env.VITE_APP_TITLE;

const url = 'http://localhost:4000/graphql';

const query = `
  query listUsers {
    allUsers {
      githubLogin
      avatar
      name
    }
  }
`;

const mutation = `
  mutation populate($count: Int!) {
    addFakeUsers(count: $count) {
      githubLogin
    }
  }
`;

const App: FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const getUsers = async (): Promise<User[]> => {
    try {
      const users = await request(url, query);
      return users.allUsers;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const addUser = async (): Promise<User | undefined> => {
    try {
      const user = await request(url, mutation, { count: 1 });
      console.log(user);
      return user;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  const addUserClick = () =>
    (async () => {
      const user = await addUser();
      if (user) {
        setUsers([...users, user]);
      }
    })();

  useEffect(() => {
    (async () => {
      const allUsers = await getUsers();
      setUsers(allUsers);
    })();
  }, [users]);

  return (
    <div className="App">
      <h1>{title}</h1>
      <Users users={users} addUserClick={addUserClick} />
    </div>
  );
};

export default App;
