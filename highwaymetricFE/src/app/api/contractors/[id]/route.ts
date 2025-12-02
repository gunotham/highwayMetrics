import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const contractor = await prisma.contractor.findUnique({
      where: { id },
    })

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found.' },
        { status: 404 }
      )
    }
    return NextResponse.json(contractor)
  } catch (error) {
    console.error(`Error fetching contractor with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: 'An error occurred while fetching the contractor.' },
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

    const updatedContractor = await prisma.contractor.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(updatedContractor)
  } catch (error) {
    console.error(`Error updating contractor with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: 'An error occurred while updating the contractor.' },
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
    await prisma.contractor.delete({
      where: { id },
    })
    return NextResponse.json(
      { message: 'Contractor deleted successfully.' },
      { status: 200 }
    )
  } catch (error) {
    console.error(`Error deleting contractor with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: 'An error occurred while deleting the contractor.' },
      { status: 500 }
    )
  }
}
