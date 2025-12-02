import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const summary = await prisma.highway.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        estimatedBudget: true,
        actualCost: true,
        reworkCount: true,
      },
    })

    return NextResponse.json({
      totalHighways: summary._count.id,
      totalEstimatedBudget: summary._sum.estimatedBudget ?? 0,
      totalActualCost: summary._sum.actualCost ?? 0,
      totalReworks: summary._sum.reworkCount ?? 0,
    })
  } catch (error) {
    console.error('Error fetching highway summary:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching the highway summary.' },
      { status: 500 }
    )
  }
}
