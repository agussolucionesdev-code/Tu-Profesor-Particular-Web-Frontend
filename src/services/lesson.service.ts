import { isAxiosError } from "axios";
import { apiClient } from "./api";
import type { ApiStandardResponse } from "./subject.service";
import type { PublishStatus } from "./course.service";

export interface LessonResponse {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  summary: string | null;
  orderIndex: number;
  status: PublishStatus;
  estimatedMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contentBlocks: number;
    assessments: number;
    progressRecords: number;
  };
}

export interface LessonPayload {
  moduleId: string;
  title: string;
  slug?: string;
  summary?: string;
  orderIndex?: number;
  status?: PublishStatus;
  estimatedMinutes?: number;
}

export type LessonUpdatePayload = Partial<Omit<LessonPayload, "moduleId">>;

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

export const lessonApiService = {
  createLesson: async (
    payload: LessonPayload,
  ): Promise<ApiStandardResponse<LessonResponse>> => {
    try {
      const response = await apiClient.post<ApiStandardResponse<LessonResponse>>(
        "/lessons",
        payload,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error during lesson creation."),
      );
    }
  },

  getLessonsByModule: async (
    moduleId: string,
  ): Promise<ApiStandardResponse<LessonResponse[]>> => {
    try {
      const response = await apiClient.get<
        ApiStandardResponse<LessonResponse[]>
      >(`/lessons/module/${moduleId}`);

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error while fetching lessons."),
      );
    }
  },

  updateLesson: async (
    id: string,
    payload: LessonUpdatePayload,
  ): Promise<ApiStandardResponse<LessonResponse>> => {
    try {
      const response = await apiClient.put<ApiStandardResponse<LessonResponse>>(
        `/lessons/${id}`,
        payload,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error during lesson update."),
      );
    }
  },

  archiveLesson: async (id: string): Promise<ApiStandardResponse<null>> => {
    try {
      const response = await apiClient.delete<ApiStandardResponse<null>>(
        `/lessons/${id}`,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error during lesson archival."),
      );
    }
  },
};
