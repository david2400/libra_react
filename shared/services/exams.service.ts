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
import { examsRepository } from './exams.repository';

export const examsService = {
  async createExam(payload: ICreateExam): Promise<IExam> {
    return examsRepository.create(payload);
  },

  async updateExam(payload: IUpdateExam): Promise<IExam> {
    return examsRepository.update(payload);
  },

  async getExamById(id: number): Promise<IExam> {
    return examsRepository.getById(id);
  },

  async startExam(payload: IStartExamPayload): Promise<IExamAttempt> {
    return examsRepository.startExam(payload);
  },

  async submitExam(payload: ISubmitExamPayload): Promise<IExamAttempt> {
    return examsRepository.submitExam(payload);
  },

  async reviewExam(payload: IReviewExamPayload): Promise<IExamAttempt> {
    return examsRepository.reviewExam(payload);
  },

  async validateExam(payload: IValidateExamPayload): Promise<IExamAttempt> {
    return examsRepository.validateExam(payload);
  },
};
