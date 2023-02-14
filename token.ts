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

  type LoginLog {
    id: ID!
    createdAt: DateTime!
    email: String!
    success: Boolean!
    token: String
  }
`;

const resolvers = {
  Mutation: {
    async login(parent, { email, password }, { req }) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      let success = false;
      let token = null;

      if (!user) {
        await prisma.loginLog.create({
          data: { email, success: false },
        });
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await compare(password, user.password_hash);

      if (!isPasswordValid) {
        await prisma.loginLog.create({
          data: { email, success: false },
        });
        throw new Error('Invalid email or password');
      }

      success = true;
      token = sign({ userId: user.id }, 'your-secret-key-here', { expiresIn: '7d' });

      await prisma.loginLog.create({
        data: { email, success, token },
      });

      return { token };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
