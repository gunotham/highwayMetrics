import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const highway = await prisma.highway.findUnique({
      where: { id },
    })

    if (!highway) {
      return NextResponse.json({ error: 'Highway not found.' }, { status: 404 })
    }
    return NextResponse.json(highway)
  } catch (error) {
    console.error(`Error fetching highway with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: 'An error occurred while fetching the highway.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { contractorId, ...dataToUpdate } = body

    const updatedHighway = await prisma.highway.update({
      where: { id },
      data: {
        ...dataToUpdate,
        ...(contractorId && { contractor: { connect: { id: contractorId } } }),
      },
    })
    return NextResponse.json(updatedHighway)
  } catch (error) {
    console.error(`Error updating highway with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: 'An error occurred while updating the highway.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    await prisma.highway.delete({
      where: { id },
    })
    return NextResponse.json(
      { message: 'Highway deleted successfully.' },
      { status: 200 }
    )
  } catch (error) {
    console.error(`Error deleting highway with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: 'An error occurred while deleting the highway.' },
      { status: 500 }
    )
  }
}