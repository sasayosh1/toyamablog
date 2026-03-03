import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

// Sanity Webhook expected payload
interface SanityWebhookPayload {
    _id: string;
    _type: string;
    title?: string;
    titleEn?: string;
    slug?: {
        current: string;
    };
    thumbnailUrl?: string;
}

export async function POST(req: Request) {
    try {
        // 1. Validate Secret
        const signature = req.headers.get('sanity-webhook-signature');
        if (!signature) {
            return NextResponse.json({ ok: false, error: 'Missing signature' }, { status: 401 });
        }

        // In production, we should verify the signature using @sanity/webhook
        // For now, we use a custom secret header approach for simplicity
        const secret = req.headers.get('x-webhook-secret');
        if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
            return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const body: SanityWebhookPayload = await req.json();
        console.log('[Sanity to X Webhook] Received payload:', body._id);

        // 3. Filter Conditions
        if (body._type !== 'post') {
            return NextResponse.json({ ok: true, message: 'Ignored: Not a post' });
        }

        if (!body.titleEn) {
            return NextResponse.json({ ok: true, message: 'Ignored: No English title (titleEn)' });
        }

        if (!body.slug?.current) {
            return NextResponse.json({ ok: true, message: 'Ignored: No slug' });
        }

        // 4. Initialize Twitter API Client
        const {
            TWITTER_API_KEY,
            TWITTER_API_SECRET,
            TWITTER_ACCESS_TOKEN,
            TWITTER_ACCESS_SECRET
        } = process.env;

        if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
            console.error('[Sanity to X Webhook] Missing Twitter API credentials');
            return NextResponse.json({ ok: false, error: 'Twitter credentials not configured' }, { status: 500 });
        }

        const twitterClient = new TwitterApi({
            appKey: TWITTER_API_KEY,
            appSecret: TWITTER_API_SECRET,
            accessToken: TWITTER_ACCESS_TOKEN,
            accessSecret: TWITTER_ACCESS_SECRET,
        });

        const rwClient = twitterClient.readWrite;

        // 5. Construct the X Post Content
        const siteUrl = 'https://sasakiyoshimasa.com/en';
        const postUrl = `${siteUrl}/blog/${body.slug.current}`;

        const tweetText = `[New Entry: ${body.titleEn}]\n\nCheck out this spot in Toyama, Japan! 🗻✨\n${postUrl}\n\n#Toyama #JapanTravel #HiddenJapan`;

        // 6. Post to X
        // Note: We use link preview cards (OGP) which will display the Sanity thumbnail automatically
        // because X scrapes the URL provided in the text.
        await rwClient.v2.tweet(tweetText);

        console.log(`[Sanity to X Webhook] Successfully tweeted for: ${body.slug.current}`);

        return NextResponse.json({
            ok: true,
            message: 'Successfully posted to X',
            tweet_content: tweetText
        });

    } catch (error: unknown) {
        console.error('[Sanity to X Webhook] Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
