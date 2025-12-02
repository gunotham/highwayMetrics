import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const contractors = await prisma.contractor.findMany()
    return NextResponse.json(contractors)
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching contractors.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Contractor name is required.' },
        { status: 400 }
      )
    }

    const newContractor = await prisma.contractor.create({
      data: {
        name,
        description,
      },
    })
    return NextResponse.json(newContractor, { status: 201 })
  } catch (error) {
    console.error('Error creating contractor:', error)
    return NextResponse.json(
      { error: 'An error occurred while creating the contractor.' },
      { status: 500 }
    )
  }
}
