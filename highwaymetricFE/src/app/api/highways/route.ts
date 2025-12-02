import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { HighwayStatus, Prisma } from '@prisma/client'
import { RoutingService } from '@/services/routing'

// Define TypeScript interfaces for better type safety
interface CreateHighwayRequest {
  name: string;
  description?: string;
  geom?: any; // GeoJSON geometry object
  status?: HighwayStatus;
  contractorId?: string;
  estimatedBudget?: number;
  actualCost?: number;
  reworkCount?: number;
  completionDate?: string; // ISO string
  lengthKm?: number;
  state?: string;
  // For route generation
  startPoint?: [number, number]; // [longitude, latitude]
  endPoint?: [number, number];   // [longitude, latitude]
  highwayRefs?: string[];        // Highway references (e.g., ['NH44'])
}

interface HighwayResponse {
  id: string;
  name: string;
  description?: string;
  geom?: any; // Parsed GeoJSON geometry
  status: HighwayStatus;
  contractorId?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedBudget?: number;
  actualCost?: number;
  reworkCount?: number;
  completionDate?: Date;
  lengthKm?: number;
  state?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function validateHighwayData(data: Partial<CreateHighwayRequest>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (data.geom) {
    // Basic validation for geometry - check if it's a valid GeoJSON structure
    if (!data.geom.type || !data.geom.coordinates) {
      errors.push('Geometry must be a valid GeoJSON object with type and coordinates');
    }
  }
  
  if (data.startPoint) {
    if (!Array.isArray(data.startPoint) || data.startPoint.length !== 2) {
      errors.push('Start point must be an array of [longitude, latitude]');
    } else {
      const [lng, lat] = data.startPoint;
      if (typeof lng !== 'number' || typeof lat !== 'number' || 
          lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        errors.push('Start point coordinates must be valid [longitude, latitude]');
      }
    }
  }
  
  if (data.endPoint) {
    if (!Array.isArray(data.endPoint) || data.endPoint.length !== 2) {
      errors.push('End point must be an array of [longitude, latitude]');
    } else {
      const [lng, lat] = data.endPoint;
      if (typeof lng !== 'number' || typeof lat !== 'number' || 
          lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        errors.push('End point coordinates must be valid [longitude, latitude]');
      }
    }
  }
  
  if (data.highwayRefs && !Array.isArray(data.highwayRefs)) {
    errors.push('Highway references must be an array of strings');
  }
  
  if (data.status && !Object.values(HighwayStatus).includes(data.status)) {
    errors.push(`Status must be one of: ${Object.values(HighwayStatus).join(', ')}`);
  }
  
  if (data.contractorId && typeof data.contractorId !== 'string') {
    errors.push('Contractor ID must be a string');
  }
  
  if (data.estimatedBudget !== undefined && (typeof data.estimatedBudget !== 'number' || data.estimatedBudget < 0)) {
    errors.push('Estimated budget must be a non-negative number');
  }
  
  if (data.actualCost !== undefined && (typeof data.actualCost !== 'number' || data.actualCost < 0)) {
    errors.push('Actual cost must be a non-negative number');
  }
  
  if (data.reworkCount !== undefined && (typeof data.reworkCount !== 'number' || data.reworkCount < 0 || !Number.isInteger(data.reworkCount))) {
    errors.push('Rework count must be a non-negative integer');
  }
  
  if (data.completionDate !== undefined) {
    const date = new Date(data.completionDate);
    if (isNaN(date.getTime())) {
      errors.push('Completion date must be a valid date string');
    }
  }
  
  if (data.lengthKm !== undefined && (typeof data.lengthKm !== 'number' || data.lengthKm < 0)) {
    errors.push('Length must be a non-negative number');
  }
  
  if (data.state && typeof data.state !== 'string') {
    errors.push('State must be a string');
  }
  
  return { isValid: errors.length === 0, errors };
}

export async function GET(request: Request) {
  try {
    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || undefined;
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Page must be a positive integer' },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be a positive integer between 1 and 100' },
        { status: 400 }
      );
    }
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Get total count for pagination metadata
    const totalCount = await prisma.highway.count({
      where: status ? { status: status as HighwayStatus } : undefined
    });
    
    // Query highways with pagination and optional status filter
    const highwaysRaw = await prisma.$queryRaw`
      SELECT id, name, description, status, "contractorId", "createdAt", "updatedAt", "estimatedBudget", "actualCost", "reworkCount", "completionDate", "lengthKm", state, ST_AsGeoJSON(geom) as geom
      FROM "Highway"
      ${status ? Prisma.sql`WHERE status = ${status}` : Prisma.empty}
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    // The 'geom' field from the raw query is a JSON string, so we need to parse it.
    const highways: HighwayResponse[] = highwaysRaw.map(highway => ({
      ...highway,
      geom: highway.geom ? JSON.parse(highway.geom) : null,
      createdAt: new Date(highway.createdAt),
      updatedAt: new Date(highway.updatedAt),
      completionDate: highway.completionDate ? new Date(highway.completionDate) : null,
    }));

    // Create paginated response
    const paginatedResponse: PaginatedResponse<HighwayResponse> = {
      data: highways,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };

    return NextResponse.json(paginatedResponse);
  } catch (error: any) {
    console.error('Error fetching highways:', error);
    
    // Provide more specific error messages based on error type
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in geometry data.' },
        { status: 500 }
      );
    }
    
    if (error.code === '22P02') { // Invalid text representation error in PostgreSQL
      return NextResponse.json(
        { error: 'Invalid geometry format in database.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching highways.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateHighwayRequest = await request.json();
    
    // Validate input data
    const validation = validateHighwayData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Check if we need to generate route geometry
    let geom = body.geom;
    if (!geom && body.startPoint && body.endPoint) {
      const apiKey = process.env.ORS_API_KEY; // Get API key from environment
      if (!apiKey) {
        return NextResponse.json(
          { error: 'ORS_API_KEY is not configured in environment variables.' },
          { status: 500 }
        );
      }

      try {
        if (body.highwayRefs && body.highwayRefs.includes('NH44') && 
            body.startPoint[0] === 78.482083 && body.endPoint[0] === 79.049083) { 
          // Generate NH44 route between Hyderabad and Nagpur
          const routeResponse = await RoutingService.getNH44Route(apiKey);
          geom = routeResponse.geometry;
        } else if (body.highwayRefs) {
          // Generate route following specific highways
          const routeResponse = await RoutingService.getHighwayRoute(
            body.startPoint,
            body.endPoint,
            body.highwayRefs,
            apiKey
          );
          geom = routeResponse.geometry;
        } else {
          // Generate general route between start and end points
          const routeResponse = await RoutingService.getRoute({
            start: body.startPoint,
            end: body.endPoint
          }, apiKey);
          geom = routeResponse.geometry;
        }
      } catch (routeError: any) {
        console.error('Error generating route:', routeError);
        return NextResponse.json(
          { error: 'Failed to generate route geometry: ' + routeError.message },
          { status: 500 }
        );
      }
    }

    const {
      name,
      description,
      status,
      contractorId,
      estimatedBudget,
      actualCost,
      reworkCount,
      completionDate,
      lengthKm,
      state,
    } = body;

    const newHighway = await prisma.highway.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        geom: geom ? geom : undefined, // Store the geometry data (either provided or generated)
        status: status || HighwayStatus.PLANNING,
        contractor: contractorId ? { connect: { id: contractorId } } : undefined,
        estimatedBudget,
        actualCost,
        reworkCount,
        completionDate: completionDate ? new Date(completionDate) : undefined,
        lengthKm,
        state,
      },
    });
    
    // Format the response to match our interface
    const response: HighwayResponse = {
      ...newHighway,
      geom: newHighway.geom ? JSON.parse(JSON.stringify(newHighway.geom)) : null,
      contractorId: newHighway.contractorId || undefined,
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating highway:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') { // Unique constraint violation
      return NextResponse.json(
        { error: `A highway with this ${error.meta?.target || 'field'} already exists.` },
        { status: 409 }
      );
    }
    
    if (error.code === 'P2003') { // Foreign key constraint violation
      return NextResponse.json(
        { error: 'Referenced contractor does not exist.' },
        { status: 400 }
      );
    }
    
    // Handle invalid geometry error
    if (error.message && error.message.includes('geometry')) {
      return NextResponse.json(
        { error: 'Invalid geometry format provided.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the highway.' },
      { status: 500 }
    );
  }
}