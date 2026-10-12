# School Database Design

## Tables

- **`students`** stores each student's ID, name, and email. The ID is the primary key, and the email is required and unique so two students cannot share the same email address.
- **`courses`** stores each course's ID and name. The ID is the primary key, and the course name is required and unique.
- **`enrolments`** records which student takes which course and stores the student's grade for that course. It has its own primary key and foreign keys pointing to `students` and `courses`. Both foreign keys are required.

## Relationships

The relationship between `students` and `enrolments` is **one-to-many**: one student can have several enrolment records, while each enrolment belongs to one student. The relationship between `courses` and `enrolments` is also **one-to-many**: one course can have several enrolment records, while each enrolment belongs to one course.

This means students and courses have a **many-to-many** relationship: a student can take multiple courses, and a course can have multiple students. The `enrolments` table is the join table that represents this relationship. It also stores the grade, which belongs to a particular student-course combination. The `UNIQUE (student_id, course_id)` constraint prevents the same student from enrolling in the same course more than once.

## Index

I would add an index on `enrolments(course_id)` because the system often needs to list students on a course or count enrolments for each course. The index can help SQLite find matching enrolment rows more efficiently. The unique constraint on `(student_id, course_id)` already supports lookups that begin with `student_id`.

## SQL or NoSQL?

I would choose a **relational SQL database** for this school system. Students, courses, enrolments, and grades have clear relationships, and foreign keys help prevent enrolments from referring to students or courses that do not exist. SQL joins make it straightforward to list courses for a student, list students on a course, and count enrolments. The unique constraints also enforce important rules, such as unique student emails and no duplicate enrolment for the same student and course. A NoSQL database could work, but it would not offer a clear advantage for this structured, relationship-focused data.
