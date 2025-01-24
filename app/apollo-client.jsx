import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { fetchAuthSession } from "aws-amplify/auth";


const httpLink = new HttpLink({ uri: "http://0.0.0.0:8000/graphql/" });


const authLink = new ApolloLink(async (operation, forward) => {
  var cognitoTokens = (await fetchAuthSession()).tokens;
  let token = cognitoTokens.idToken
  console.log({token})
  operation.setContext({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return forward(operation);
});

const client = new ApolloClient({
  uri: "http://127.0.0.1:8000/graphql", // Replace <YOUR_BACKEND_URL> with your backend's address
  cache: new InMemoryCache(), // In-memory caching,
  link: authLink.concat(httpLink),

});

export default client;