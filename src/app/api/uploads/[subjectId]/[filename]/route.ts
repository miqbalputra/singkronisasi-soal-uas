import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subjectId: string; filename: string }> }
) {
  const { subjectId, filename } = await context.params

  // Construct absolute path to the file
  const filePath = path.join(process.cwd(), 'public', 'uploads', subjectId, filename)

  if (!existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 })
  }

  try {
    const fileBuffer = await readFile(filePath)
    
    // Determine content type (basic)
    let contentType = 'application/octet-stream'
    if (filename.toLowerCase().endsWith('.pdf')) contentType = 'application/pdf'
    if (filename.toLowerCase().endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (filename.toLowerCase().endsWith('.doc')) contentType = 'application/msword'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error reading file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
