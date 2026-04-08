import { isAxiosError } from "axios";
import { apiClient } from "./api";
import type { ApiStandardResponse } from "./subject.service";

export type ContentBlockType =
  | "TEXT"
  | "FORMULA"
  | "IMAGE"
  | "VIDEO"
  | "CALLOUT"
  | "QUIZ"
  | "GRAPHIC_2D"
  | "GRAPHIC_3D";

export interface ContentBlockPayload {
  moduleId: string;
  lessonId?: string;
  type: ContentBlockType;
  contentPayload: Record<string, unknown>;
  appearanceOrder: number;
  animationType?: string;
  isHighlight?: boolean;
}

export interface ContentBlockResponse {
  id: string;
  moduleId: string;
  lessonId: string | null;
  type: ContentBlockType;
  contentPayload: Record<string, unknown>;
  appearanceOrder: number;
  animationType: string;
  isHighlight: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ContentBlockUpdatePayload = Partial<
  Pick<
    ContentBlockPayload,
    "type" | "contentPayload" | "appearanceOrder" | "animationType" | "isHighlight"
  >
>;

export interface ContentBlockReorderPayload {
  items: Array<{
    id: string;
    appearanceOrder: number;
  }>;
}

const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

export const contentBlockApiService = {
  createContentBlock: async (
    payload: ContentBlockPayload,
  ): Promise<ApiStandardResponse<ContentBlockResponse>> => {
    try {
      const response = await apiClient.post<
        ApiStandardResponse<ContentBlockResponse>
      >("/content-blocks", payload);

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unexpected error during content block creation.",
        ),
      );
    }
  },

  updateContentBlock: async (
    id: string,
    payload: ContentBlockUpdatePayload,
  ): Promise<ApiStandardResponse<ContentBlockResponse>> => {
    try {
      const response = await apiClient.put<
        ApiStandardResponse<ContentBlockResponse>
      >(`/content-blocks/${id}`, payload);

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unexpected error while updating the content block.",
        ),
      );
    }
  },

  getContentBlocksByLesson: async (
    lessonId: string,
  ): Promise<ApiStandardResponse<ContentBlockResponse[]>> => {
    try {
      const response = await apiClient.get<
        ApiStandardResponse<ContentBlockResponse[]>
      >(`/content-blocks/lesson/${lessonId}`);

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unexpected error while fetching content blocks.",
        ),
      );
    }
  },

  reorderLessonContentBlocks: async (
    lessonId: string,
    payload: ContentBlockReorderPayload,
  ): Promise<ApiStandardResponse<ContentBlockResponse[]>> => {
    try {
      const response = await apiClient.patch<
        ApiStandardResponse<ContentBlockResponse[]>
      >(`/content-blocks/lesson/${lessonId}/reorder`, payload);

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unexpected error while reordering content blocks.",
        ),
      );
    }
  },

  deleteContentBlock: async (
    id: string,
  ): Promise<ApiStandardResponse<undefined>> => {
    try {
      const response = await apiClient.delete<ApiStandardResponse<undefined>>(
        `/content-blocks/${id}`,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unexpected error while deleting the content block.",
        ),
      );
    }
  },
};
