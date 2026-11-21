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

  type Directory {
    id: Int!
    area: String!
    district: String!
    country: String!
    thana: String!
    companies: [Company!]!
  }

  type Company {
    id: Int!
    directoryId: Int!
    directory: Directory!
    name: String!
    website: String
    type: String!
    location: String!
    area: String!
    thana: String!
    district: String!
    country: String!
    services: [String!]!
    email: String
    phone: String
    verification_status: String!
    job_status: String!
    createdAt: DateTime!
    updatedAt: DateTime!
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

  input DirectoryInput {
    area: String!
    district: String!
    country: String!
    thana: String!
  }

  input DirectoryUpdateInput {
    area: String
    district: String
    country: String
    thana: String
  }

  input CompanyInput {
    directoryId: Int!
    name: String!
    website: String
    type: String!
    location: String!
    area: String!
    thana: String!
    district: String!
    country: String!
    services: [String!]
    email: String
    phone: String
    verification_status: String!
    job_status: String!
  }

  input CompanyUpdateInput {
    name: String
    website: String
    type: String
    location: String
    area: String
    thana: String
    district: String
    country: String
    services: [String!]
    email: String
    phone: String
    verification_status: String
    job_status: String
  }

  type Query {
    organizations(kind: String, search: String): [Organization!]!
    organization(id: Int!): Organization

    directories(search: String): [Directory!]!
    directory(id: Int!): Directory

    companies(directoryId: Int, search: String): [Company!]!
    company(id: Int!): Company
  }

  type Mutation {
    createOrganization(input: OrganizationInput!): Organization!
    updateOrganization(id: Int!, input: OrganizationUpdateInput!): Organization!
    deleteOrganization(id: Int!): Boolean!

    createDirectory(input: DirectoryInput!): Directory!
    updateDirectory(id: Int!, input: DirectoryUpdateInput!): Directory!
    deleteDirectory(id: Int!): Boolean!

    createCompany(input: CompanyInput!): Company!
    updateCompany(id: Int!, input: CompanyUpdateInput!): Company!
    deleteCompany(id: Int!): Boolean!
  }
`;