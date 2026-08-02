export interface KnowledgeChunk {
  id: string;
  title: string;
  tags: string[];
  body: string;
  /** audience hint for ranking / prompts */
  audience?: "student" | "pro";
}
