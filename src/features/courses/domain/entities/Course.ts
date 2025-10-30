export interface Course {
  id: string;
  name: string;
  nrc: number;
  teacher: string;
  category: string;
  enrolledUsers: string[];
  maxStudents: number;
}

export const createCourse = (courseData: Partial<Course>): Course => ({
  id: courseData.id || '',
  name: courseData.name || '',
  nrc: courseData.nrc || 0,
  teacher: courseData.teacher || '',
  category: courseData.category || 'General',
  enrolledUsers: courseData.enrolledUsers || [],
  maxStudents: courseData.maxStudents || 30,
});

export const getEnrolledCount = (course: Course): number => course.enrolledUsers.length;
export const hasAvailableSpots = (course: Course): boolean => 
  getEnrolledCount(course) < course.maxStudents;