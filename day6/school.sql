-- Day 6 Assignment: A School Database
-- SQLite-compatible SQL
-- Run this file in SQLite (for example, https://sqliteonline.com/).

PRAGMA foreign_keys = ON;

-- Reset tables so this script can be run again safely.
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- 1. Students table
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- 2. Courses table
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE
);

-- 3. Enrolments links students and courses and stores each student's grade.
-- UNIQUE(student_id, course_id) prevents duplicate enrolment in the same course.
CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    UNIQUE (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- Sample students (4 students so one can demonstrate having no enrolments).
INSERT INTO students (student_id, name, email) VALUES
    (1, 'Amina Hassan', 'amina.hassan@example.com'),
    (2, 'Dawit Bekele', 'dawit.bekele@example.com'),
    (3, 'Sara Mohammed', 'sara.mohammed@example.com'),
    (4, 'Yonas Tadesse', 'yonas.tadesse@example.com');

-- Sample courses
INSERT INTO courses (course_id, course_name) VALUES
    (1, 'Database Fundamentals'),
    (2, 'Web Development'),
    (3, 'Computer Networking');

-- At least 5 enrolments
INSERT INTO enrolments (enrolment_id, student_id, course_id, grade) VALUES
    (1, 1, 1, 'A'),
    (2, 1, 2, 'B'),
    (3, 2, 1, 'B'),
    (4, 2, 3, 'A'),
    (5, 3, 2, 'A');

-- Query 1: All courses for one student, searched by student name.
SELECT s.name AS student_name, c.course_name
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE s.name = 'Amina Hassan'
ORDER BY c.course_name;

-- Query 2: All students enrolled on one course.
SELECT c.course_name, s.name AS student_name
FROM courses AS c
JOIN enrolments AS e ON e.course_id = c.course_id
JOIN students AS s ON s.student_id = e.student_id
WHERE c.course_name = 'Web Development'
ORDER BY s.name;

-- Query 3: Number of students per course, including courses with zero enrolments.
SELECT c.course_name, COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_name;

-- Query 4: Students who have no enrolments.
SELECT s.student_id, s.name, s.email
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.student_id
WHERE e.student_id IS NULL
ORDER BY s.name;

-- Query 5: Update one enrolment's grade, then display the changed row.
UPDATE enrolments
SET grade = 'A'
WHERE enrolment_id = 2;

SELECT e.enrolment_id, s.name AS student_name, c.course_name, e.grade
FROM enrolments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE e.enrolment_id = 2;

-- Suggested additional index:
-- CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);
-- This can help queries that find students or count enrolments by course.
-- The UNIQUE(student_id, course_id) constraint already creates an index
-- useful for lookups beginning with student_id.
