export type Teacher = {
  id: number;
  avatar: string;
  name: string;
  email: string;
  lattes: string;
  departament_code: string;
  departament_name: string;
};

export type SubjectLink = { name: string; url: string };

export type Subject = {
  id: string;
  code: string;
  name: string;
  time: number;
  isOptional: boolean;
  status: "todo" | "doing" | "done";
  note: string | null;
  links: SubjectLink[];
  grade: number | null;
  periodId: string;
  periodName: string;
  teacher: Teacher | null;
};

export type Period = {
  id: string;
  name: string;
  visible: boolean;
  subjectIds: string[];
};

export type Course = {
  code: string;
  name: string;
  period_emergence: string;
  workload_total: number;
  workload_normal_lessons: number;
  workload_optional_lessons: number;
  workload_complementary: number;
  workload_academic_professional_guidance: number;
};

export type Complementary = { id: number; name: string; time: number };

export type CurriculumResponse =
  | { hasCurriculum: false; courses: Pick<Course, "code" | "name" | "period_emergence">[]; complementary: Complementary[] }
  | {
      hasCurriculum: true;
      course: Course;
      periods: Period[];
      subjects: Record<string, Subject>;
      filter: { obligatory: boolean; optional: boolean; todo: boolean; doing: boolean; done: boolean };
      complementary: Complementary[];
    };

export type CalendarEvent = {
  id: number;
  title: string;
  start: string;
  end: string;
  description: string;
};
