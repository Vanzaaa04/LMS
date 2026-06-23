/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(
    userId: string,
    userRole: string,
    data: {
      title: string;
      moduleId: string;
      xpReward: number;
      passingScore: number;
      timeLimit?: number;
      status?: string;
    },
  ) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: data.moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Forbidden: Only the instructor or Admin can create a quiz in this course',
      );
    }

    // 2. create quiz
    const quiz = await this.prisma.quiz.create({
      data: {
        title: data.title,
        moduleId: data.moduleId,
        xpReward: data.xpReward,
        passingScore: data.passingScore,
        timeLimit: data.timeLimit ?? 30,
        status: data.status ?? 'DRAFT',
      },
    });

    // Kirim notifikasi cohort ke mahasiswa & dosen di kelas tersebut
    await this.notificationService.createCohortNotification(
      module.courseId,
      'Kuis Baru Dirilis',
      `Kuis baru '${data.title}' telah ditambahkan pada modul ${module.title} di kelas ${module.course.title}.`,
    );

    return quiz;
  }

  async findAll(filters: { courseId?: string; moduleId?: string } = {}) {
    return this.prisma.quiz.findMany({
      where: {
        ...(filters.moduleId ? { moduleId: filters.moduleId } : {}),
        ...(filters.courseId ? { module: { courseId: filters.courseId } } : {}),
      },
      select: {
        id: true,
        title: true,
        status: true,
        moduleId: true,
        xpReward: true,
        passingScore: true,
        timeLimit: true,
        _count: {
          select: { questions: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Protection: Remove correctAnswer from each question
    const sanitizedQuestions = quiz.questions.map((q) => {
      const { correctAnswer: _correctAnswer, ...rest } = q;
      return rest;
    });

    return {
      ...quiz,
      questions: sanitizedQuestions,
    };
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    data: {
      title?: string;
      timeLimit?: number;
      xpReward?: number;
      passingScore?: number;
      status?: string;
    },
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Validation: Only course instructor or admin can update
    if (quiz.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this quiz',
      );
    }

    return this.prisma.quiz.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Validation: Only course instructor or admin can remove
    if (quiz.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to delete this quiz',
      );
    }

    return this.prisma.quiz.delete({
      where: { id },
    });
  }

  async submit(
    id: string,
    userId: string,
    answers: { questionId: string; answer: string }[],
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const existingSubmission = await this.prisma.quizSubmission.findUnique({
      where: {
        quizId_studentId: {
          quizId: id,
          studentId: userId,
        },
      },
    });

    if (existingSubmission) {
      throw new ForbiddenException('You have already submitted this quiz');
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const details: {
      questionId: string;
      question: string;
      correctAnswer: string;
      studentAnswer: string | null;
      isCorrect: boolean;
    }[] = [];

    for (const q of quiz.questions) {
      const studentAnswer =
        answers.find((a) => a.questionId === q.id)?.answer || null;
      const isCorrect = studentAnswer === q.correctAnswer;

      if (isCorrect) correctCount++;

      details.push({
        questionId: q.id,
        question: q.question,
        correctAnswer: q.correctAnswer,
        studentAnswer: studentAnswer,
        isCorrect,
      });
    }

    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;
    const passed = score >= quiz.passingScore;
    let xpGained = 0;

    if (passed) {
      xpGained = quiz.xpReward;
      // Increment XP
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpGained },
        },
      });
    }

    await this.prisma.quizSubmission.create({
      data: {
        quizId: id,
        studentId: userId,
        score,
        passed,
        details,
      },
    });

    return {
      score,
      passed,
      xpGained,
      details,
    };
  }

  async createQuestion(
    userId: string,
    userRole: string,
    data: {
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: string;
      quizId: string;
    },
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: data.quizId },
      include: { module: { include: { course: true } } },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to add questions to this quiz',
      );
    }

    return this.prisma.quizQuestion.create({
      data: {
        quizId: data.quizId,
        question: data.question,
        options: {
          optionA: data.optionA,
          optionB: data.optionB,
          optionC: data.optionC,
          optionD: data.optionD,
        },
        correctAnswer: data.correctAnswer,
      },
    });
  }

  async getQuestionsForQuiz(quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const questions = await this.prisma.quizQuestion.findMany({
      where: { quizId },
    });

    return questions.map((q) => {
      const opts = (q.options as Record<string, string>) || {};
      return {
        id: q.id,
        question: q.question,
        optionA: opts.optionA ?? '',
        optionB: opts.optionB ?? '',
        optionC: opts.optionC ?? '',
        optionD: opts.optionD ?? '',
      };
    });
  }

  async updateQuestion(
    id: string,
    userId: string,
    userRole: string,
    data: {
      question?: string;
      optionA?: string;
      optionB?: string;
      optionC?: string;
      optionD?: string;
      correctAnswer?: string;
    },
  ) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            module: { include: { course: true } },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Quiz question not found');
    }

    if (question.quiz.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this question',
      );
    }

    const currentOpts = (question.options as Record<string, string>) || {};
    const updatedOpts = {
      optionA: data.optionA !== undefined ? data.optionA : currentOpts.optionA,
      optionB: data.optionB !== undefined ? data.optionB : currentOpts.optionB,
      optionC: data.optionC !== undefined ? data.optionC : currentOpts.optionC,
      optionD: data.optionD !== undefined ? data.optionD : currentOpts.optionD,
    };

    return this.prisma.quizQuestion.update({
      where: { id },
      data: {
        question: data.question,
        options: updatedOpts,
        correctAnswer: data.correctAnswer,
      },
    });
  }

  async deleteQuestion(id: string, userId: string, userRole: string) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            module: { include: { course: true } },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Quiz question not found');
    }

    if (question.quiz.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to delete this question',
      );
    }

    return this.prisma.quizQuestion.delete({
      where: { id },
    });
  }

  async getSubmission(quizId: string, studentId: string) {
    const submission = await this.prisma.quizSubmission.findUnique({
      where: {
        quizId_studentId: {
          quizId,
          studentId,
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Quiz submission not found');
    }

    return submission;
  }

  async getSubmissionsList(quizId: string, userId: string, userRole: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        submissions: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to view submissions for this quiz',
      );
    }

    return {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        status: quiz.status,
        xpReward: quiz.xpReward,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
      },
      submissions: quiz.submissions,
      courseEnrollments: quiz.module.course.enrollments,
    };
  }
}
