const { ApolloServer, gql } = require('apollo-server');
const { compare, hash } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const typeDefs = gql`
  type Query {
    # Add any additional queries here
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload
  }

  type AuthPayload {
    token: String!
  }
`;

const resolvers = {
  Mutation: {
    async login(parent, { email, password }) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await compare(password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = sign({ userId: user.id }, 'your-secret-key-here', { expiresIn: '7d' });

      return { token };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
