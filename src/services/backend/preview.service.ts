import { runRead } from './shared';

export interface EntityPreviewData {
  title: string;
  description: string;
}

export const previewService = {
  async getPreviewData(type: string, id: string): Promise<EntityPreviewData | null> {
    try {
      if (type === 'village') {
        const rows = await runRead(
          `MATCH (c:Mosaic_Community {id: $id}) RETURN c`,
          { id },
          (row: Record<string, unknown>) => row['c'] as { name: string; description?: string; slug: string }
        );
        if (rows.length > 0) {
          return {
            title: rows[0].name || 'Unknown Village',
            description: rows[0].description || 'A community on Mosaic',
          };
        }
      }
      else if (type === 'project') {
        const rows = await runRead(
          `MATCH (p:Mosaic_Project {id: $id}) RETURN p`,
          { id },
          (row: Record<string, unknown>) => row['p'] as { title: string; description?: string }
        );
        if (rows.length > 0) {
          return {
            title: rows[0].title || 'Unknown Project',
            description: rows[0].description || 'A project on Mosaic',
          };
        }
      }
      else if (type === 'piece' || type === 'publication') {
        const rows = await runRead(
          `MATCH (p:Mosaic_Piece {id: $id}) RETURN p`,
          { id },
          (row: Record<string, unknown>) => row['p'] as { title: string; contentType?: string }
        );
        if (rows.length > 0) {
          // Check if it's an Artifact that wasn't renamed yet in the DB
          return {
            title: rows[0].title || 'Untitled Piece',
            description: `Type: ${rows[0].contentType || 'Document'}`, // pieces don't have descriptions, so we fallback to a type string or empty
          };
        } else {
          // Fallback to Artifact label if the DB hasn't migrated yet
          const legacyRows = await runRead(
            `MATCH (p:Mosaic_Artifact {id: $id}) RETURN p`,
            { id },
            (row: Record<string, unknown>) => row['p'] as { title: string; contentType?: string }
          );
          if (legacyRows.length > 0) {
            return {
              title: legacyRows[0].title || 'Untitled Piece',
              description: `Type: ${legacyRows[0].contentType || 'Document'}`,
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error(`Error fetching preview for ${type} ${id}:`, error);
      return null;
    }
  }
};
