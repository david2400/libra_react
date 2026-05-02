import { httpClient, withApiError } from './http-client';
import type {
  ICreateExam,
  IUpdateExam,
  IStartExamPayload,
  ISubmitExamPayload,
  IReviewExamPayload,
  IValidateExamPayload,
  IExam,
  IExamAttempt,
} from '@/server/domains/control-academico/types';

const EXAMS_BASE_PATH = '/api/kleverkids/control-academico/examenes';

export const examsRepository = {
  async create(payload: ICreateExam) {
    return withApiError(httpClient.post<IExam>(EXAMS_BASE_PATH, payload).then(r => r.data));
  },

  async update(payload: IUpdateExam) {
    return withApiError(
      httpClient.put<IExam>(`${EXAMS_BASE_PATH}/${payload.id}`, payload).then(r => r.data)
    );
  },

  async getById(id: number) {
    return withApiError(httpClient.get<IExam>(`${EXAMS_BASE_PATH}/${id}`).then(r => r.data));
  },

  async startExam(payload: IStartExamPayload) {
    return withApiError(
      httpClient
        .post<IExamAttempt>(`${EXAMS_BASE_PATH}/${payload.exam_id}/iniciar`, payload)
        .then(r => r.data)
    );
  },

  async submitExam(payload: ISubmitExamPayload) {
    return withApiError(
      httpClient
        .post<IExamAttempt>(`${EXAMS_BASE_PATH}/${payload.exam_id}/enviar`, payload)
        .then(r => r.data)
    );
  },

  async reviewExam(payload: IReviewExamPayload) {
    return withApiError(
      httpClient
        .post<IExamAttempt>(`${EXAMS_BASE_PATH}/${payload.exam_id}/revisar`, payload)
        .then(r => r.data)
    );
  },

  async validateExam(payload: IValidateExamPayload) {
    return withApiError(
      httpClient
        .post<IExamAttempt>(`${EXAMS_BASE_PATH}/${payload.exam_id}/validar`, payload)
        .then(r => r.data)
    );
  },
};
