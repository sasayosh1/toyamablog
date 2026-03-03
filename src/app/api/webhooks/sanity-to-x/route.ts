import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

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
        console.log('[Sanity to X Webhook] Triggered (Secret bypassed for testing)');

        // 2. Parse Body
        const body: SanityWebhookPayload = await req.json();
        console.log('[Sanity to X Webhook] Received payload:', body._id);

        if (!body.titleEn || !body.slug?.current) {
            return NextResponse.json({ ok: true, message: 'Ignored: Missing fields' });
        }

        // 4. Initialize Twitter API Client
        const {
            TWITTER_API_KEY,
            TWITTER_API_SECRET,
            TWITTER_ACCESS_TOKEN,
            TWITTER_ACCESS_SECRET
        } = process.env;

        const twitterClient = new TwitterApi({
            appKey: TWITTER_API_KEY!,
            appSecret: TWITTER_API_SECRET!,
            accessToken: TWITTER_ACCESS_TOKEN!,
            accessSecret: TWITTER_ACCESS_SECRET!,
        });

        const rwClient = twitterClient.readWrite;

        // 5. Construct the X Post Content
        const siteUrl = 'https://sasakiyoshimasa.com/en';
        const postUrl = `${siteUrl}/blog/${body.slug.current}`;

        const tweetText = `[New Entry: ${body.titleEn}]\n\nCheck out this spot in Toyama, Japan! 🗻✨\n${postUrl}\n\n#Toyama #JapanTravel #HiddenJapan`;

        // 6. Post to X
        try {
            const res = await rwClient.v2.tweet(tweetText);
            return NextResponse.json({ ok: true, message: 'Successfully posted to X', data: res });
        } catch (twitterError: any) {
            return NextResponse.json({
                ok: false,
                error: 'Twitter API Error captured in catch block',
                message: twitterError.message || String(twitterError),
                name: twitterError.name,
                code: twitterError.code,
                rateLimit: twitterError.rateLimit,
                data: twitterError.data,
                type: twitterError.type
            }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
