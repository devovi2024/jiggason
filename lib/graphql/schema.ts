export const typeDefs = /* GraphQL */ `
  scalar DateTime

  type Organization {
    id: Int!
    kind: String!
    name: String!
    org: String
    website: String
    email: String
    phone: String
    createdAt: DateTime!
  }

  input OrganizationInput {
    kind: String!
    name: String!
    org: String
    website: String
    email: String
    phone: String
  }

  input OrganizationUpdateInput {
    kind: String
    name: String
    org: String
    website: String
    email: String
    phone: String
  }

  type Query {
    organizations(kind: String, search: String): [Organization!]!
    organization(id: Int!): Organization
  }

  type Mutation {
    createOrganization(input: OrganizationInput!): Organization!
    updateOrganization(id: Int!, input: OrganizationUpdateInput!): Organization!
    deleteOrganization(id: Int!): Boolean!
  }
`;