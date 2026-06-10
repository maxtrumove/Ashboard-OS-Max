generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  apps        App[]
}

model App {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name      String
  kind      String   @default("system")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  graphs    Graph[]
}

model Graph {
  id        String   @id @default(cuid())
  appId     String
  app       App      @relation(fields: [appId], references: [id], onDelete: Cascade)
  name      String
  viewport  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  nodes     Node[]
  edges     Edge[]
  runs      Run[]
}

model Node {
  id      String @id @default(cuid())
  graphId String
  graph   Graph  @relation(fields: [graphId], references: [id], onDelete: Cascade)
  type    String
  title   String
  posX    Float  @default(0)
  posY    Float  @default(0)
  data    String @default("{}")
}

model Edge {
  id           String  @id @default(cuid())
  graphId      String
  graph        Graph   @relation(fields: [graphId], references: [id], onDelete: Cascade)
  sourceNodeId String
  sourceHandle String?
  targetNodeId String
  targetHandle String?
}

model Run {
  id         String    @id @default(cuid())
  graphId    String
  graph      Graph     @relation(fields: [graphId], references: [id], onDelete: Cascade)
  status     String    @default("pending")
  startedAt  DateTime  @default(now())
  finishedAt DateTime?
  inputVars  String?
  steps      RunStep[]
}

model RunStep {
  id            String  @id @default(cuid())
  runId         String
  run           Run     @relation(fields: [runId], references: [id], onDelete: Cascade)
  nodeId        String
  sequence      Int     @default(0)
  compiledInput String?
  output        String?
  status        String  @default("pending")
  error         String?
}

model Credential {
  id        String   @id @default(cuid())
  provider  String
  label     String
  secretEnc String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ConnectorDef {
  id        String   @id @default(cuid())
  name      String
  kind      String
  config    String   @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
