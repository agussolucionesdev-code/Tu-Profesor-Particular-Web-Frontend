import { isAxiosError } from "axios";
import { apiClient } from "./api";
import type { ApiStandardResponse, SubjectResponse } from "./subject.service";

export type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CourseResponse {
  id: string;
  subjectId: string;
  subject?: SubjectResponse;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  status: PublishStatus;
  level: string | null;
  estimatedMinutes: number | null;
  thumbnailAssetId: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    modules: number;
    enrollments: number;
  };
}

export interface CoursePayload {
  subjectId: string;
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  status?: PublishStatus;
  level?: string;
  estimatedMinutes?: number;
  thumbnailAssetId?: string;
}

export type CourseUpdatePayload = Partial<Omit<CoursePayload, "subjectId">>;

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

export const courseApiService = {
  createCourse: async (
    payload: CoursePayload,
  ): Promise<ApiStandardResponse<CourseResponse>> => {
    try {
      const response = await apiClient.post<ApiStandardResponse<CourseResponse>>(
        "/courses",
        payload,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error during course creation."),
      );
    }
  },

  getCourses: async (): Promise<ApiStandardResponse<CourseResponse[]>> => {
    try {
      const response =
        await apiClient.get<ApiStandardResponse<CourseResponse[]>>("/courses");

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error while fetching courses."),
      );
    }
  },

  getPublishedCourses: async (): Promise<
    ApiStandardResponse<CourseResponse[]>
  > => {
    try {
      const response = await apiClient.get<ApiStandardResponse<CourseResponse[]>>(
        "/courses/published",
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Unexpected error while fetching published courses.",
        ),
      );
    }
  },

  updateCourse: async (
    id: string,
    payload: CourseUpdatePayload,
  ): Promise<ApiStandardResponse<CourseResponse>> => {
    try {
      const response = await apiClient.put<ApiStandardResponse<CourseResponse>>(
        `/courses/${id}`,
        payload,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error during course update."),
      );
    }
  },

  archiveCourse: async (id: string): Promise<ApiStandardResponse<null>> => {
    try {
      const response = await apiClient.delete<ApiStandardResponse<null>>(
        `/courses/${id}`,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error during course archival."),
      );
    }
  },
};
