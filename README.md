# 🐞 BugScope

BugScope is an interactive graph-based application for visualizing and analyzing how production bugs propagate through a microservices architecture.

Instead of viewing bugs as isolated records, BugScope models the relationships between **Bugs, APIs, Services, Teams, Developers, Frontends, and Customers** using a graph database. This enables powerful impact analysis through graph traversal.

---

## ✨ Features

- 📊 Interactive dependency graph
- 🐞 Browse production bugs
- 🔍 View bug impact scope
- 👨‍💻 Identify affected developers
- 🏗️ Discover downstream service dependencies
- 📈 Impact metrics (Services, Developers, Customers, Score)
- ⚡ Graph traversal powered by CognoDB

---

# Why a Graph Database?

In modern microservice systems, a single production bug rarely affects only one service.

For example:

```
Bug
 ↓
API
 ↓
Service
 ├──► Service
 ├──► Team
 │      └──► Developers
 └──► Frontend
         └──► Customers
```

With a relational database, answering questions like:

- Which services are impacted?
- Which developers should be notified?
- Which downstream services are affected?
- How many customers may experience failures?

requires multiple joins and recursive queries.

A graph database naturally models these relationships, allowing efficient multi-hop traversals.

Example traversal:

```cypher
MATCH p=(b:Bug {id:"BUG4"})-[*1..4]-(n)
RETURN p;
```

---

# Graph Data Model

## Node Types

| Label | Description | Properties |
|--------|-------------|------------|
| Bug | Production incident | id, title, severity, status |
| API | Backend endpoint | id, endpoint, method |
| Service | Microservice | id, name |
| Team | Engineering team | id, name |
| Developer | Team member | id, name, role |
| Frontend | Web/Mobile application | id, name |
| Customer | End user | id, name |

---

## Relationship Types

| Relationship | Description |
|--------------|-------------|
| `AFFECTS` | Bug → API |
| `BELONGS_TO` | API → Service |
| `CALLS` | Service → Service |
| `OWNED_BY` | Service → Team |
| `HAS_MEMBER` | Team → Developer |
| `CALLS` | Frontend → API |
| `USES` | Customer → Frontend |

---

# Data Model Diagram

```
                        +-------------+
                        |    Bug      |
                        | Production  |
                        +-------------+
                               |
                           AFFECTS
                               |
                               ▼
                        +-------------+
                        |     API     |
                        | /orders     |
                        +-------------+
                               |
                         BELONGS_TO
                               |
                               ▼
                        +-------------+
                        |  Service    |
                        | Order       |
                        +-------------+
                           |       |
                    OWNED_BY       CALLS
                           |          |
                           ▼          ▼
                    +-------------+  +-------------+
                    |    Team     |  |  Service    |
                    | Payments    |  | Inventory   |
                    +-------------+  +-------------+
                           |
                      HAS_MEMBER
                           |
                           ▼
                    +-------------+
                    | Developer   |
                    +-------------+

Customer ──USES──▶ Frontend ──CALLS──▶ API
```

---

# Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- React Query
- React Force Graph
- CognoDB (Graph Database)

---

# Project Structure

```
src
├── app
│   ├── api
│   ├── bugs
│   └── dashboard
├── components
├── lib
└── seed
```

---

# Setup

## 1. Clone the repository

```bash
git clone <repository-url>
cd bugscope
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Create a CognoDB Database

1. Visit **https://console.cognodb.com/**
2. Sign in or create an account.
3. Click **Create Database**.
4. Choose the **Free** plan.
5. Wait for the database to be provisioned.
6. Open the database details page.
7. Copy:
   - Bolt URL
   - Username
   - Password

---

## 4. Configure Environment Variables

Create a `.env` file in the project root.

```env
COGNODB_URI=bolt+s://xxxxxxxx.databases.cognodb.com
COGNODB_USERNAME=your_username
COGNODB_PASSWORD=your_password
```

---

## 5. Seed the Database

Run the seed scripts to populate the graph with sample data.

```bash
npm run seed
```

The dataset includes approximately:

- 40 Bugs
- 30 APIs
- 22 Services
- 8 Teams
- 32 Developers
- 12 Frontends
- 50 Customers
- 500+ Relationships

---

## 6. Start the Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Main Queries

## Dashboard Statistics

Returns:

- Open Bugs
- Services
- Developers
- Customers

```cypher
MATCH (b:Bug)
RETURN count(b)
```

---

## Bug Details

Retrieve information about a production bug.

```cypher
MATCH (b:Bug {id:$id})
-[:AFFECTS]->
(a:API)
-[:BELONGS_TO]->
(s:Service)
RETURN b,a,s
```

---

## Service Dependencies

Find downstream services affected by a bug.

```cypher
MATCH (b:Bug {id:$id})
-[:AFFECTS]->
(:API)
-[:BELONGS_TO]->
(s:Service)
OPTIONAL MATCH (s)-[:CALLS]->(dep:Service)
RETURN dep
```

---

## Developers

Identify developers responsible for the affected service.

```cypher
MATCH (b:Bug {id:$id})
-[:AFFECTS]->
(:API)
-[:BELONGS_TO]->
(s:Service)
-[:OWNED_BY]->
(t:Team)
-[:HAS_MEMBER]->
(d:Developer)
RETURN d
```

---

## Graph Traversal

Retrieve the bug's connected subgraph for visualization.

```cypher
MATCH p=(b:Bug {id:$id})-[*0..4]-(n)
RETURN p
```

This powers the interactive graph shown in the Bug Details page.

---

# Impact Metrics

For each bug, BugScope computes:

- Impact Score
- Affected Services
- Affected Developers
- Affected Customers

These metrics are derived from graph traversals and summarize the scope of a production issue.

---

# Future Improvements

- Real-time incident updates
- Graph filtering
- Root cause analysis
- Blast radius visualization
- Time-based dependency analysis
- AI-powered impact prediction

---

# License

This project was developed as part of the **CognoDB Graph Database Assignment** using Next.js and CognoDB.