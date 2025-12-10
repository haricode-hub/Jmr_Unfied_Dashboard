
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Details Request Body:", body);
        const { brn, acc } = body;

        if (!brn || !acc) {
            return NextResponse.json({ error: "Missing brn or acc" }, { status: 400 });
        }

        // Step 1: Fetch Full Record Details (Logic from approval route)
        const queryBaseUrl = process.env.CUSTOMER_ACCOUNT_QUERY_URL;
        if (!queryBaseUrl) {
            return NextResponse.json({ error: "Configuration Error: CUSTOMER_ACCOUNT_QUERY_URL missing" }, { status: 500 });
        }
        const queryUrl = `${queryBaseUrl}/brn/${brn}/acc/${acc}`;
        console.log(`Fetching details from: ${queryUrl}`);

        const queryRes = await fetch(queryUrl, {
            cache: 'no-store',
            headers: {
                'BRANCH': brn,
                'Entity': 'ENTITY_ID1',
                'Source': 'FCAT',
                'Userid': 'SYSTEM'
            }
        });

        if (!queryRes.ok) {
            const errorText = await queryRes.text();
            console.error(`Failed to fetch record: ${queryRes.status} ${queryRes.statusText}`, errorText);
            return NextResponse.json({
                error: `Failed to fetch record from ${queryUrl}: ${queryRes.status} ${queryRes.statusText}`,
                details: errorText
            }, { status: queryRes.status });
        }

        const queryData = await queryRes.json();

        // We return the raw data for now, user can refine mapping later
        return NextResponse.json({ success: true, data: queryData });

    } catch (error: any) {
        console.error("Details fetch error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
