import { useMemo, useState } from 'react';
import { Course, CourseLevel } from '@/lib/types/course';
import { CategoryOption } from '@/components/course/CourseFilters';

const ITEMS_PER_PAGE = 6;

export function useCourses(
  courses: Course[],
  searchQuery: string,
  sourceFilter?: (course: Course) => boolean
) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>('All');
  const [selectedLevel, setSelectedLevel] = useState<'All' | CourseLevel>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (sourceFilter && !sourceFilter(course)) {
        return false;
      }

      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.code.toLowerCase().includes(normalizedQuery) ||
        course.category.toLowerCase().includes(normalizedQuery) ||
        course.instructorName.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [courses, normalizedQuery, selectedCategory, selectedLevel, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCourses = filteredCourses.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (category: CategoryOption) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleLevelChange = (level: 'All' | CourseLevel) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedLevel('All');
    setCurrentPage(1);
  };

  return {
    selectedCategory,
    setSelectedCategory: handleCategoryChange,
    selectedLevel,
    setSelectedLevel: handleLevelChange,
    filteredCourses,
    paginatedCourses,
    totalPages,
    currentPage: safeCurrentPage,
    setCurrentPage: handlePageChange,
    resetFilters,
  };
}
