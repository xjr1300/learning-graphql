import { FC } from 'react';

export type User = {
  githubLogin: string;
  name: string;
  avatar: string;
};

type Props = {
  users: User[];
  addUserClick: () => void;
};

const Users: FC<Props> = ({ users = [], addUserClick = undefined }) => (
  <>
    {users.map((user) => (
      <User key={user.githubLogin} name={user.name} avatar={user.avatar} />
    ))}
    <button onClick={addUserClick}>Add User</button>
  </>
);

type UserProps = {
  name: string;
  avatar: string;
};

const User: FC<UserProps> = ({ name, avatar }) => (
  <div>
    <img src={avatar} alt="" />
    {name}
  </div>
);
export default Users;
