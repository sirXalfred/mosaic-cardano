
import PiecePageContent from '@/components/piece/PiecePageContent';
import { pieceService } from '@/services/backend/piece.service';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ piece_id: string }> }): Promise<Metadata> {
  const { piece_id } = await params;

  // Fetch the piece data directly here since metadata cannot be async in the old App Router
  const piece = await pieceService.getPieceById(piece_id);
  const title = piece?.title || 'Piece';
  const community = piece?.community?.name || 'Mosaic community';

  return {
    title: title,
    description: `Read Piece: ${title} from ${community} | Mosaic`,
    openGraph: {
      title: title,
      description: `Read Piece: ${title} from ${community} | Mosaic`
    },
  };
}

export default async function PiecePage({ params }: { params: Promise<{ piece_id: string }> }) {
  const { piece_id } = await params;

  // Fetch the piece data directly here since metadata cannot be async in the old App Router
  const piece = await pieceService.getPieceById(piece_id);

  return (
    <PiecePageContent piece={piece} />
  );
}
