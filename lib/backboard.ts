import type { Memory } from "./types";

const BASE_URL =
  process.env.BACKBOARD_BASE_URL ??
  "https://app.backboard.io/api";

function credentials() {
  const apiKey =
    process.env.BACKBOARD_API_KEY;

  const assistantId =
    process.env.BACKBOARD_ASSISTANT_ID;

  if (!apiKey || !assistantId) {
    throw new Error(
      "Backboard credentials are not configured",
    );
  }

  return {
    apiKey,
    assistantId,
  };
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { apiKey } = credentials();

  const response = await fetch(
    `${BASE_URL}${path}`,
    {
      ...init,
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Backboard request failed (${response.status}): ` +
        `${await response.text()}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function searchMemories(
  query: string,
): Promise<Memory[]> {
  const { assistantId } = credentials();

  const data = await request<{
    memories?: Array<
      Record<string, unknown>
    >;
  }>(
    `/assistants/${assistantId}/memories/search`,
    {
      method: "POST",
      body: JSON.stringify({
        query,
        limit: 5,
      }),
    },
  );

  return (data.memories ?? [])
    .map((item) => {
      const metadata =
        typeof item.metadata === "object" &&
        item.metadata !== null
          ? (item.metadata as Record<
              string,
              unknown
            >)
          : undefined;

      return {
        id: String(
          item.id ??
            item.memory_id ??
            crypto.randomUUID(),
        ),
        content: String(
          item.content ?? "",
        ),
        score:
          typeof item.score === "number"
            ? item.score
            : undefined,
        source: metadata
          ? String(
              metadata.source ??
                "Backboard memory",
            )
          : "Backboard memory",
        createdAt:
          typeof item.created_at === "string"
            ? item.created_at
            : undefined,
      };
    })
    .filter(
      (memory) =>
        memory.content.trim().length > 0,
    );
}

export function hasBackboardConfig() {
  return Boolean(
    process.env.BACKBOARD_API_KEY &&
      process.env.BACKBOARD_ASSISTANT_ID,
  );
}