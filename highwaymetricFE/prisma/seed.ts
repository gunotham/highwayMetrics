import { PrismaClient, Prisma, HighwayStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create Contractors
  const lnt = await prisma.contractor.upsert({
    where: { name: 'L&T Construction' },
    update: {},
    create: { name: 'L&T Construction', description: 'Larsen & Toubro' },
  });

  const gmr = await prisma.contractor.upsert({
    where: { name: 'GMR Group' },
    update: {},
    create: {
      name: 'GMR Group',
      description: 'GMR Group is an Indian infrastructure company headquartered in New Delhi.',
    },
  });

  const meil = await prisma.contractor.upsert({
    where: { name: 'Megha Engineering & Infrastructures Ltd (MEIL)' },
    update: {},
    create: { name: 'Megha Engineering & Infrastructures Ltd (MEIL)', description: 'MEIL' },
  });

  console.log('Created contractors:', { lnt, gmr, meil });

  // Create highways using routes from routing service (start/end coordinates)
  const highwaysToCreate = [
    { 
      name: 'NH 44 (Hyderabad to Nagpur)', 
      ref: 'NH44', 
      contractorId: lnt.id, 
      status: HighwayStatus.CONSTRUCTION,
      state: 'Telangana-Maharashtra',
      start: [78.482083, 17.520417], // Hyderabad
      end: [79.049083, 21.021194]   // Nagpur
    },
    { 
      name: 'Hyderabad-Vijayawada Highway', 
      ref: 'NH16', 
      contractorId: meil.id, 
      status: HighwayStatus.COMPLETED,
      state: 'Telangana-Andhra Pradesh',
      start: [78.482083, 17.520417], // Hyderabad
      end: [80.620654, 16.506174]   // Vijayawada
    },
    { 
      name: 'Hyderabad-Warangal Highway', 
      ref: 'NH123', 
      contractorId: gmr.id, 
      status: HighwayStatus.MAINTENANCE,
      state: 'Telangana',
      start: [78.482083, 17.520417], // Hyderabad
      end: [79.583817, 18.015286]   // Warangal
    }
  ];

  for (const hw of highwaysToCreate) {
    console.log(`Creating highway: ${hw.name} from ${hw.start} to ${hw.end}`);

    try {
      // For now, we'll create a simple route between start and end points
      // In a real implementation, you would call the routing service to get actual route geometry
      // Here's a placeholder with multiple points to make a more realistic path
      
      // This is a simplified approach - creating a path with intermediate points
      // In a real implementation, you would use the RoutingService.getRoute() method
      const routeCoordinates = [hw.start];
      
      // Add some intermediate points to make the route more realistic
      // This is a simplified simulation - in practice you'd use actual routing APIs
      const numIntermediatePoints = 15; // More points for a more realistic path
      
      for (let i = 1; i < numIntermediatePoints; i++) {
        const fraction = i / numIntermediatePoints;
        const lng = hw.start[0] + (hw.end[0] - hw.start[0]) * fraction;
        const lat = hw.start[1] + (hw.end[1] - hw.start[1]) * fraction;
        
        // Add slight variations to make it more realistic (like real roads have curves)
        const variation = 0.02 * Math.sin(i);
        routeCoordinates.push([lng + variation, lat + variation * 0.5]);
      }
      
      routeCoordinates.push(hw.end);

      const highway = await prisma.highway.upsert({
        where: { name: hw.name },
        update: {
          contractorId: hw.contractorId,
          status: hw.status,
          ref: hw.ref,
          state: hw.state,
        },
        create: {
          name: hw.name,
          ref: hw.ref,
          contractorId: hw.contractorId,
          status: hw.status,
          state: hw.state,
          estimatedBudget: Math.random() * 1000000000 + 100000000, // Random budget between 100M-1.1B
          actualCost: Math.random() * 800000000, // Random actual cost
          reworkCount: Math.floor(Math.random() * 5),
          completionDate: hw.status === HighwayStatus.COMPLETED ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 2) : new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 365),
          lengthKm: Math.random() * 500 + 100 // Random length between 100-600 km
        },
      });

      // Create MultiLineString geometry from the route coordinates
      const geometryToInsert = {
        type: 'MultiLineString',
        coordinates: [routeCoordinates]
      };
      
      const geoJsonString = JSON.stringify(geometryToInsert);
      await prisma.$executeRaw`UPDATE "Highway" SET geom = ST_GeomFromGeoJSON(${geoJsonString})::geometry(MultiLineString, 4326) WHERE id = ${highway.id}`;
      
      console.log(`Created highway with route geometry: ${highway.name}`);

    } catch (e) {
      console.error(`Failed to create ${hw.name}:`, e);
      // Create highway without geometry as fallback
      const highway = await prisma.highway.upsert({
        where: { name: hw.name },
        update: {
          contractorId: hw.contractorId,
          status: hw.status,
          ref: hw.ref,
          state: hw.state,
        },
        create: {
          name: hw.name,
          ref: hw.ref,
          contractorId: hw.contractorId,
          status: hw.status,
          state: hw.state,
          estimatedBudget: Math.random() * 1000000000 + 100000000, // Random budget between 100M-1.1B
          actualCost: Math.random() * 800000000, // Random actual cost
          reworkCount: Math.floor(Math.random() * 5),
          completionDate: hw.status === HighwayStatus.COMPLETED ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 2) : new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 365),
          lengthKm: Math.random() * 500 + 100 // Random length between 100-600 km
        },
      });
      console.log(`Created highway as fallback (no geometry): ${highway.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
