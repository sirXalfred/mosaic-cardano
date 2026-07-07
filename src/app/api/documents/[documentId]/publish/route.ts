import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { documentService } from '@/services/backend/document.service';
import { villageService } from '@/services/backend/village.service';
import { anchorContributionManifest, ContributionManifest } from '@/lib/cardano/minting';
import { z } from 'zod';

export const runtime = 'nodejs';

const PublishSchema = z.object({
  communityId: z.string().min(1)
});

export const POST = withAuth(async (request, { params }, userId) => {
  try {
    const { documentId } = await params as { documentId: string };
    const body = await request.json();
    
    const parseResult = PublishSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid data: communityId is required' }, { status: 400 });
    }

    const { communityId } = parseResult.data;

    // 1. Fetch document to build manifest
    const document = await documentService.getDocument(documentId, userId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // 2. Fetch community name for metadata FIRST
    const village = await villageService.getCommunityByIdOrSlug(communityId);
    if (!village) {
        return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // 3. Publish in Neo4j (this also verifies all signatures are present)
    const pieceId = await documentService.publishDocumentToPiece(documentId, userId, communityId);

    // 3. Build Manifest
    const manifest: ContributionManifest = {
      title: document.title,
      contentHash: document.contentUrl, // Cloudinary URL or hash
      communityId: communityId,
      communityName: village.name,
      contributors: document.contributions?.map(c => ({
        userId: c.userId,
        name: c.name,
        role: c.role,
        weight: c.weight,
        signature: c.signatureHash || 'no_sig',
        walletAddress: c.walletAddress || 'unlinked_wallet'
      })) || [],
      timestamp: Date.now()
    };

    // 4. Anchor to Cardano
    const txHash = await anchorContributionManifest(manifest);

    // 5. Store txHash in Neo4j and advance stage to success
    await documentService.updateDocument(pieceId, userId, { 
      ipfsHash: txHash,
      publishStage: 'success'
    });
    
    return NextResponse.json({ success: true, pieceId, txHash });
  } catch (error: unknown) {
    console.error('Failed to publish document:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});
