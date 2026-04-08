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
};
