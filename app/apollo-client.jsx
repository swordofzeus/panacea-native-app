import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://127.0.0.1:8000/graphql", // Replace <YOUR_BACKEND_URL> with your backend's address
  cache: new InMemoryCache(), // In-memory caching
});

export default client;