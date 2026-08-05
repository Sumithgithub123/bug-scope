import { driver } from '@/lib/cognodb';

(async () => {
  const session = driver.session();

  await session.run(`MATCH (s:Service)
WITH collect(s) AS services

MATCH (d:Deployment)
WITH services, collect(d) AS deployments

UNWIND range(0,size(services)-1) AS i

WITH services[i] AS service,
deployments[i % size(deployments)] AS deployment

MERGE (service)-[:DEPLOYED_ON]->(deployment)

RETURN count(*);`);

  await session.close();
  await driver.close();

  console.log("✅ Seed completed");
})();
