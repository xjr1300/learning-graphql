const requestGithubToken = (credentials) =>
  fetch("https://github.com/login/oauth/access_token", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(credentials),
  })
    .then((response) => response.json())
    .catch((error) => {
      throw new Error(JSON.stringify(error));
    });

const requestGithubUserAccount = (token) =>
  fetch(`https://api.github.com/user?access_token=${token}`)
    .then(toJSON)
    .catch(throwError);

const authorizeWithGithub = async (credentials) => {
  const { accessToken } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(accessToken);
  return { ...githubUser, accessToken };
};
