const { ApolloServer, gql } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const typeDefs = gql`
  type Query {
    # Add any additional queries here
  }

  type Mutation {
    updateUser(id: ID!, firstName: String, email: String, gender: Gender, city: String): User
  }

  type User {
    id: ID!
    firstName: String!
    email: String!
    gender: Gender!
    city: String!
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  type EditLog {
    id: ID!
    createdAt: DateTime!
    userId: ID!
    firstName: String
    email: String
    gender: Gender
    city: String
  }
`;

const resolvers = {
  Mutation: {
    async updateUser(parent, { id, firstName, email, gender, city }, { req }) {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const oldUserData = { firstName: user.firstName, email: user.email, gender: user.gender, city: user.city };

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          firstName: firstName || user.firstName,
          email: email || user.email,
          gender: gender || user.gender,
          city: city || user.city,
        },
      });

      await prisma.editLog.create({
        data: {
          userId: user.id,
          firstName: updatedUser.firstName !== oldUserData.firstName ? updatedUser.firstName : null,
          email: updatedUser.email !== oldUserData.email ? updatedUser.email : null,
          gender: updatedUser.gender !== oldUserData.gender ? updatedUser.gender : null,
          city: updatedUser.city !== oldUserData.city ? updatedUser.city : null,
        },
      });

      return updatedUser;
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
