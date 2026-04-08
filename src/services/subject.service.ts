import { isAxiosError } from "axios";
import { apiClient } from "./api";

export interface SubjectResponse {
  id: string;
  name: string;
  description: string | null;
  colorHex: string;
  iconName: string | null;
  _count?: {
    modules: number;
  };
}

export interface ApiStandardResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
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

export const subjectApiService = {
  createSubject: async (
    name: string,
  ): Promise<ApiStandardResponse<SubjectResponse>> => {
    try {
      const response = await apiClient.post<
        ApiStandardResponse<SubjectResponse>
      >("/subjects", { name });

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "An unexpected system error occurred during subject creation.",
        ),
      );
    }
  },

  getSubjects: async (): Promise<ApiStandardResponse<SubjectResponse[]>> => {
    try {
      const response =
        await apiClient.get<ApiStandardResponse<SubjectResponse[]>>(
          "/subjects",
        );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "An unexpected system error occurred while fetching subjects.",
        ),
      );
    }
  },

  updateSubject: async (
    id: string,
    name: string,
  ): Promise<ApiStandardResponse<SubjectResponse>> => {
    try {
      const response = await apiClient.put<ApiStandardResponse<SubjectResponse>>(
        `/subjects/${id}`,
        { name },
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error during subject update."),
      );
    }
  },

  deleteSubject: async (id: string): Promise<ApiStandardResponse<null>> => {
    try {
      const response = await apiClient.delete<ApiStandardResponse<null>>(
        `/subjects/${id}`,
      );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, "Unexpected error during subject deletion."),
      );
    }
  },
};
