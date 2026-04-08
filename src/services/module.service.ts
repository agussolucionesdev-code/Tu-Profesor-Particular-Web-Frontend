import { isAxiosError } from "axios";
import { apiClient } from "./api";
import type { ApiStandardResponse, SubjectResponse } from "./subject.service";
import type { CourseResponse, PublishStatus } from "./course.service";
import type { LessonResponse } from "./lesson.service";

export interface ModuleResponse {
  id: string;
  title: string;
  subjectId: string;
  subject?: SubjectResponse;
  courseId: string | null;
  course?: CourseResponse | null;
  orderIndex: number;
  status: PublishStatus;
  isActive: boolean;
  lessons?: LessonResponse[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    lessons: number;
    contentBlocks: number;
  };
}

export interface ModulePayload {
  title: string;
  subjectId: string;
  courseId?: string;
  orderIndex?: number;
  status?: PublishStatus;
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

export const moduleApiService = {
  createModule: async (
    payload: ModulePayload,
  ): Promise<ApiStandardResponse<ModuleResponse>> => {
    try {
      const response = await apiClient.post<ApiStandardResponse<ModuleResponse>>(
        "/modules",
        payload,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error during module creation."),
      );
    }
  },

  getModulesByCourse: async (
    courseId: string,
  ): Promise<ApiStandardResponse<ModuleResponse[]>> => {
    try {
      const response = await apiClient.get<ApiStandardResponse<ModuleResponse[]>>(
        `/modules/course/${courseId}`,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error while fetching modules."),
      );
    }
  },
};
