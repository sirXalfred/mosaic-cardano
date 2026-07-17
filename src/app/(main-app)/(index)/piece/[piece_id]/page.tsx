
import PiecePageContent from '@/components/piece/PiecePageContent';
import { pieceService } from '@/services/backend/piece.service';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { cache } from "react";

const getPiece = cache(async (id: string) => {
  return pieceService.getPieceById(id);
});

export async function generateMetadata({ params }: { params: Promise<{ piece_id: string }> }): Promise<Metadata> {
  const { piece_id } = await params;

  // Fetch the piece data directly here since metadata cannot be async in the old App Router
  const piece = await getPiece(piece_id);
  if (!piece) {
    return {
      title: 'Piece Not Found',
      description: 'The requested piece could not be found.',
    };
  }
  const title = piece.title;
  const community = piece.community?.name || 'Mosaic community';

  return {
    title: title,
    description: `Read Piece: ${title} from ${community} | Mosaic`,
    openGraph: {
      title: title,
      description: `Read Piece: ${title} from ${community} | Mosaic`
    },
  };
}

export const generateStaticParams = async () => {
  try {
    const pieces = await pieceService.getFeaturedPieces(10);
    return pieces.map((piece) => ({
      piece_id: piece.id,
    }));
  } catch (error) {
    console.warn('Skipping pre-rendering for pieces during build (DB unreachable):', error instanceof Error ? error.message : error);
    return [];
  }
};

export default async function PiecePage({ params }: { params: Promise<{ piece_id: string }> }) {
  const { piece_id } = await params;

  // Fetch the piece data directly here since metadata cannot be async in the old App Router
  const piece = await getPiece(piece_id);

  if (!piece) {
    notFound();
  }

  return (
    <PiecePageContent piece={piece} />
  );
}
