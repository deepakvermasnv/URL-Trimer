import { NextRequest, NextResponse } from 'next/server';
import {
  submitToIndexNow,
  submitAllSiteUrls,
  notifyPagePublished,
  notifyPageUpdated,
  notifyPageDeleted,
  getAllSiteUrls,
} from '@/lib/indexnow';

/**
 * API Route: /api/indexnow
 * Allows client or server webhooks to trigger IndexNow submissions.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { urls, action, force, submitAll } = body;

    if (submitAll) {
      const result = await submitAllSiteUrls({ force });
      return NextResponse.json(result);
    }

    if (!urls || (Array.isArray(urls) && urls.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Missing "urls" array or "submitAll: true" in request body.',
          submittedUrls: [],
          skippedDuplicates: [],
        },
        { status: 400 }
      );
    }

    const options = { force };
    let result;

    if (action === 'delete') {
      result = await notifyPageDeleted(urls, options);
    } else if (action === 'update') {
      result = await notifyPageUpdated(urls, options);
    } else if (action === 'publish') {
      result = await notifyPagePublished(urls, options);
    } else {
      result = await submitToIndexNow(urls, options);
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : result.statusCode || 500,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: `Internal error processing IndexNow request: ${error?.message || 'Unknown error'}`,
        submittedUrls: [],
        skippedDuplicates: [],
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const urlParam = searchParams.get('url');
  const allParam = searchParams.get('all');
  const forceParam = searchParams.get('force') === 'true';

  if (allParam === 'true') {
    const result = await submitAllSiteUrls({ force: forceParam });
    return NextResponse.json(result);
  }

  if (urlParam) {
    const result = await submitToIndexNow(urlParam, { force: forceParam });
    return NextResponse.json(result);
  }

  return NextResponse.json({
    service: 'IndexNow URL Submission Engine',
    status: 'active',
    host: process.env.INDEXNOW_HOST || 'urltrim.online',
    keyLocation:
      process.env.INDEXNOW_KEY_LOCATION ||
      `https://${process.env.INDEXNOW_HOST || 'urltrim.online'}/6eb31472270545a2acba5fbbb0e9d175.txt`,
    allKnownUrls: getAllSiteUrls(),
    usage: {
      post: 'POST /api/indexnow with body { urls: ["/path"], action: "publish"|"update"|"delete", submitAll?: boolean }',
      get: 'GET /api/indexnow?all=true or GET /api/indexnow?url=/path',
    },
  });
}
