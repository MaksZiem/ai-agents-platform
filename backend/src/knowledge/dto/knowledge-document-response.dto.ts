import { ApiProperty } from '@nestjs/swagger';
import { KnowledgeDocument } from '../entities/knowledge-document.entity.js';

export class DocumentAgentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  name: string;
}

export class DocumentChunkDto {
  @ApiProperty({ description: 'Kolejność fragmentu w dokumencie', example: 0 })
  position: number;

  content: string;
}

export class KnowledgeDocumentListItemDto extends KnowledgeDocument {
  @ApiProperty({
    description: 'Agenci, którzy mają dostęp do dokumentu',
    type: () => DocumentAgentDto,
    isArray: true,
  })
  agents: DocumentAgentDto[];
}

export class KnowledgeDocumentDetailDto extends KnowledgeDocumentListItemDto {
  @ApiProperty({
    description: 'Fragmenty tekstu, na które podzielono dokument',
    type: () => DocumentChunkDto,
    isArray: true,
  })
  chunks: DocumentChunkDto[];
}

export class AttachedDocumentDto extends KnowledgeDocument {
  @ApiProperty({ description: 'Kiedy dokument został przypięty do agenta' })
  attachedAt: Date;
}
