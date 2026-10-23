-- Database Xuân Lộc: cấu trúc 27 bảng + dữ liệu mẫu (xuất từ DB local ngày 2026-10-23).
-- Container MySQL tự chạy file này ở lần khởi động đầu tiên (khi volume dữ liệu còn trống).
-- Đã chuẩn hoá: bỏ BOM, đổi CRLF -> LF, xoá refresh_token đang lưu (người dùng chỉ cần đăng nhập lại).

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `certificates`;
DROP TABLE IF EXISTS `class_lessons`;
DROP TABLE IF EXISTS `class_schedules`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `course_registrations`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `exam_choices`;
DROP TABLE IF EXISTS `exam_questions`;
DROP TABLE IF EXISTS `exam_submissions`;
DROP TABLE IF EXISTS `exams`;
DROP TABLE IF EXISTS `grades`;
DROP TABLE IF EXISTS `lesson_materials`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `refunds`;
DROP TABLE IF EXISTS `registration_notes`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `student_details`;
DROP TABLE IF EXISTS `submission_answers`;
DROP TABLE IF EXISTS `teacher_details`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `vouchers`;
DROP TABLE IF EXISTS `waitlist`;
CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_action` (`action`),
  KEY `idx_activity_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `student_id` int NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('present','absent','late') COLLATE utf8mb4_unicode_ci DEFAULT 'present',
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_daily_attendance` (`class_id`,`student_id`,`attendance_date`),
  KEY `student_id` (`student_id`),
  KEY `idx_attendance_date` (`attendance_date`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `certificates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enrollment_id` int NOT NULL,
  `certificate_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_certificate_enrollment` (`enrollment_id`),
  UNIQUE KEY `unique_certificate_code` (`certificate_code`),
  CONSTRAINT `fk_certificate_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `class_lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `taught_date` date DEFAULT NULL,
  `status` enum('pending','completed','skipped') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `homework_assigned` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_lesson` (`class_id`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `class_lessons_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_lessons_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `class_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `session_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Phòng 1',
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  KEY `idx_session_date` (`session_date`),
  CONSTRAINT `fk_schedule_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `teacher_id` int DEFAULT NULL,
  `class_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `room` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Phòng 1',
  `schedule_text` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` enum('upcoming','ongoing','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ongoing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `max_students` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `idx_class_status` (`status`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `course_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `reject_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `assigned_to` int DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  `source` enum('facebook','zalo','walkin','referral','other') COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `referred_by_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_registration_course` (`course_id`),
  KEY `idx_registration_status` (`status`),
  KEY `fk_registration_assignee` (`assigned_to`),
  CONSTRAINT `fk_registration_assignee` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_registration_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tuition_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `duration_months` int DEFAULT '3',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `class_id` int NOT NULL,
  `status` enum('active','dropped','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `voucher_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_class` (`student_id`,`class_id`),
  KEY `class_id` (`class_id`),
  KEY `fk_enrollment_voucher` (`voucher_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollment_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `exam_choices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `choice_text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT '0',
  `order_index` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_choice_question` (`question_id`),
  CONSTRAINT `fk_choice_question` FOREIGN KEY (`question_id`) REFERENCES `exam_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `exam_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(5,2) NOT NULL DEFAULT '1.00',
  `order_index` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_question_exam` (`exam_id`),
  CONSTRAINT `fk_question_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `exam_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `student_id` int NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_submission_exam_student` (`exam_id`,`student_id`),
  KEY `fk_submission_student` (`student_id`),
  CONSTRAINT `fk_submission_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submission_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exam_course` (`course_id`),
  CONSTRAINT `fk_exam_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enrollment_id` int NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(4,2) NOT NULL,
  `teacher_comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `enrollment_id` (`enrollment_id`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lesson_materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `file_title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `lesson_materials_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `lesson_number` int NOT NULL,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_course_lesson` (`course_id`,`lesson_number`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enrollment_id` int NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','transfer') COLLATE utf8mb4_unicode_ci DEFAULT 'cash',
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `enrollment_id` (`enrollment_id`),
  KEY `idx_payment_date` (`payment_date`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `refunds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enrollment_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_refund_enrollment` (`enrollment_id`),
  CONSTRAINT `fk_refund_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `registration_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_note_registration` (`registration_id`),
  KEY `fk_note_author` (`created_by`),
  CONSTRAINT `fk_note_author` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_note_registration` FOREIGN KEY (`registration_id`) REFERENCES `course_registrations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `class_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review_student_class` (`student_id`,`class_id`),
  KEY `idx_review_class` (`class_id`),
  CONSTRAINT `fk_review_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `student_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `student_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date DEFAULT NULL,
  `parent_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `student_code` (`student_code`),
  KEY `idx_student_code` (`student_code`),
  CONSTRAINT `student_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `submission_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `question_id` int NOT NULL,
  `choice_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_answer_submission` (`submission_id`),
  KEY `fk_answer_question` (`question_id`),
  KEY `fk_answer_choice` (`choice_id`),
  CONSTRAINT `fk_answer_choice` FOREIGN KEY (`choice_id`) REFERENCES `exam_choices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `exam_questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_answer_submission` FOREIGN KEY (`submission_id`) REFERENCES `exam_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `teacher_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `specialization` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `degree` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rate_per_session` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `teacher_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codeChangePass` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','teacher','student') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'student',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `refresh_token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `codeChangePass_attempts` int DEFAULT '0',
  `codeChangePass_expires_at` timestamp NULL DEFAULT NULL,
  `referral_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `referral_code` (`referral_code`),
  KEY `idx_user_email` (`email`),
  KEY `idx_user_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('percent','fixed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fixed',
  `discount_value` decimal(10,2) NOT NULL,
  `max_uses` int DEFAULT NULL,
  `used_count` int NOT NULL DEFAULT '0',
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_voucher_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `waitlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `class_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_waitlist_student_class` (`student_id`,`class_id`),
  KEY `idx_waitlist_class` (`class_id`),
  CONSTRAINT `fk_waitlist_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_waitlist_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `activity_logs` (`id`, `user_id`, `user_role`, `action`, `entity_type`, `entity_id`, `meta`, `created_at`) VALUES
(1, 1, 'admin', 'enrollment.set_discount', 'enrollments', 1, '{\"discount_amount\": 500000}', '2026-08-30 08:12:56'),
(2, 1, 'admin', 'refund.create', 'refunds', 1, '{\"amount\": 200000, \"enrollment_id\": 1}', '2026-08-30 08:12:56'),
(3, 1, 'admin', 'grade.create', 'grades', 2, '{\"score\": 9, \"title\": \"Cuoi ky\", \"enrollment_id\": 1}', '2026-08-30 08:16:37'),
(4, 1, 'admin', 'user.delete', 'users', 6, '{\"deletedEmail\": \"waitlist-test@xuanloc.edu.vn\"}', '2026-08-30 08:17:20'),
(5, 1, 'admin', 'enrollment.update_status', 'enrollments', 1, '{\"status\": \"completed\"}', '2026-08-30 08:31:26'),
(6, 1, 'admin', 'enrollment.apply_voucher', 'enrollments', 1, '{\"voucher_code\": \"WELCOME10\", \"discount_from_voucher\": 550000}', '2026-08-30 08:31:52'),
(7, 1, 'admin', 'user.delete', 'users', 7, '{\"deletedEmail\": \"referral-test@xuanloc.edu.vn\"}', '2026-08-30 08:32:54'),
(8, 1, 'admin', 'user.reset_password', 'users', 8, NULL, '2026-09-01 06:24:49'),
(9, 1, 'admin', 'user.delete', 'users', 8, '{\"deletedEmail\": \"test.user@xuanloc.edu.vn\"}', '2026-09-01 06:30:38'),
(10, 1, 'admin', 'payment.create', 'payments', 2, '{\"amount\": 500000, \"enrollment_id\": 1}', '2026-09-05 14:03:36'),
(11, 1, 'admin', 'enrollment.update_status', 'enrollments', 4, '{\"status\": \"dropped\"}', '2026-09-06 04:54:38'),
(12, 1, 'admin', 'enrollment.update_status', 'enrollments', 4, '{\"status\": \"active\"}', '2026-09-06 04:55:19'),
(13, 2, 'teacher', 'grade.create', 'grades', 3, '{\"score\": 7.5, \"title\": \"Kiem tra Unit 3\", \"enrollment_id\": 4}', '2026-09-06 05:46:48'),
(14, 1, 'admin', 'payment.create', 'payments', 3, '{\"amount\": 100000, \"enrollment_id\": 1}', '2026-09-20 03:23:14'),
(15, 1, 'admin', 'payment.create', 'payments', 4, '{\"amount\": 3800000, \"enrollment_id\": 4, \"payment_method\": \"transfer\"}', '2026-09-20 04:41:55');
INSERT INTO `attendance` (`id`, `class_id`, `student_id`, `attendance_date`, `status`, `note`, `created_at`, `updated_at`) VALUES
(5, 2, 3, '2026-09-20', 'present', NULL, '2026-09-20 03:27:37', '2026-09-20 03:27:37');
INSERT INTO `certificates` (`id`, `enrollment_id`, `certificate_code`, `issued_at`, `created_at`) VALUES
(1, 1, 'XL-2026-000001', '2026-08-30 08:31:26', '2026-08-30 08:31:26');
INSERT INTO `class_lessons` (`id`, `class_id`, `lesson_id`, `taught_date`, `status`, `homework_assigned`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-08-20', 'completed', NULL, '2026-08-30 08:12:42', '2026-09-06 06:00:43');
INSERT INTO `class_schedules` (`id`, `class_id`, `session_date`, `start_time`, `end_time`, `room`, `note`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-09-07', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 1: Khai giảng, phân tích cấu trúc đề IELTS & Diagnostic Test', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(2, 1, '2026-09-09', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 2: Listening Section 1 - Form Completion & Kỹ thuật bắt keywords', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(3, 1, '2026-09-11', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 3: Reading - Skimming, Scanning & Xác định Paraphrase', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(4, 1, '2026-09-14', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 4: Speaking Part 1 - Fluency, Coherence & Topic Study/Work', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(5, 1, '2026-09-16', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 5: Writing Task 1 - Tổng quan cấu trúc Line Graph và Overview', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(6, 1, '2026-09-18', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 6: Listening Section 2 - Multiple Choice & Map Labeling', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(7, 2, '2026-09-08', '19:30:00', '21:00:00', 'Phòng Studio A', 'Buổi 1: Khai giảng & Test từ vựng thương mại khởi động', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(8, 2, '2026-09-10', '19:30:00', '21:00:00', 'Phòng Studio A', 'Buổi 2: Listening Part 1 - Mô tả tranh hành động người & cảnh vật', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(9, 2, '2026-09-12', '19:30:00', '21:00:00', 'Phòng Studio A', 'Buổi 3: Reading Part 5 - Danh từ, Đại từ và Quy tắc chia động từ', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(10, 2, '2026-09-15', '19:30:00', '21:00:00', 'Phòng Studio A', 'Buổi 4: Listening Part 2 - Câu hỏi Wh-questions & Bẫy đồng âm', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(11, 2, '2026-09-17', '19:30:00', '21:00:00', 'Phòng Studio A', 'Buổi 5: Reading Part 6 - Kỹ thuật điền câu & Phân tích ngữ cảnh', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(12, 3, '2026-09-12', '08:30:00', '10:30:00', 'Phòng Hội Thảo', 'Buổi 1: Phá băng, chuẩn hóa bảng phiên âm IPA & Ngữ điệu câu', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(13, 3, '2026-09-13', '08:30:00', '10:30:00', 'Phòng Hội Thảo', 'Buổi 2: Roleplay - Chào hỏi, bắt chuyện xã giao và trao đổi danh thiếp', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(14, 3, '2026-09-19', '08:30:00', '10:30:00', 'Phòng Hội Thảo', 'Buổi 3: Phản xạ đặt câu hỏi tình huống tại sân bay và ga tàu', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(15, 3, '2026-09-20', '08:30:00', '10:30:00', 'Phòng Hội Thảo', 'Buổi 4: Giao tiếp nhà hàng - Gọi món, phàn nàn dịch vụ và thanh toán', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(16, 4, '2026-08-01', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 1: Speaking Mock Test Part 1 & Sửa lỗi phát âm âm đuôi', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(17, 4, '2026-08-04', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 2: Writing Task 1 - Phân tích Bar Chart so sánh nhiều đối tượng', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(18, 4, '2026-08-06', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 3: Listening Section 3 - Thảo luận học thuật đa luồng ý kiến', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(19, 4, '2026-08-08', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 4: Reading - Dạng bài True/False/Not Given & Yes/No/Not Given', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(20, 4, '2026-08-11', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 5: Writing Task 2 - Cấu trúc bài Opinion Essay dạng Agree/Disagree', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(21, 4, '2026-08-13', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 6: Speaking Part 2 - Kỹ thuật Take-notes trong 1 phút & Lập dàn bài', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(22, 4, '2026-08-15', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 7: Listening Section 4 - Bài giảng chuyên ngành & Tốc độ nói nhanh', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(23, 4, '2026-08-18', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 8: Kiểm tra giữa kỳ - Mock Test Listening & Reading Cam 18', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(24, 4, '2026-08-20', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 9: Chữa bài thi giữa kỳ & Giải thích chi tiết các bẫy từ vựng', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(25, 4, '2026-08-22', '18:00:00', '19:30:00', 'Phòng IELTS Lab', 'Buổi 10: Speaking Part 3 - Phát triển ý tưởng mang tính xã hội trừu tượng', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(26, 5, '2026-09-19', '14:30:00', '16:30:00', 'Phòng Smart Kids', 'Buổi 1: Khai giảng, làm quen qua bài hát Phonics Alphabet', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(27, 5, '2026-09-20', '14:30:00', '16:30:00', 'Phòng Smart Kids', 'Buổi 2: Nhận diện màu sắc và đồ vật học tập qua tranh tô màu', '2026-08-23 04:35:12', '2026-08-23 04:35:12');
INSERT INTO `classes` (`id`, `course_id`, `teacher_id`, `class_name`, `room`, `schedule_text`, `start_date`, `status`, `created_at`, `updated_at`, `max_students`) VALUES
(1, 1, 2, 'IELTS-2601', 'Phòng IELTS Lab (Tầng 2)', 'Tối Thứ 2 - 4 - 6 (18:00 - 19:30)', '2026-09-07', 'upcoming', '2026-08-23 04:35:12', '2026-08-23 04:35:12', NULL),
(2, 2, 2, 'TOEIC-2602', 'Phòng Studio A (Tầng 1)', 'Tối Thứ 3 - 5 - 7 (19:30 - 21:00)', '2026-09-08', 'upcoming', '2026-08-23 04:35:12', '2026-08-23 04:35:12', NULL),
(3, 3, 2, 'COMM-2603', 'Phòng Hội Thảo (Tầng 3)', 'Sáng Thứ 7 - Chủ Nhật (08:30 - 10:30)', '2026-09-12', 'upcoming', '2026-08-23 04:35:12', '2026-08-23 04:35:12', NULL),
(4, 1, 2, 'IELTS-2600-ADV', 'Phòng IELTS Lab (Tầng 2)', 'Tối Thứ 3 - 5 - 7 (18:00 - 19:30)', '2026-08-01', 'ongoing', '2026-08-23 04:35:12', '2026-08-23 04:35:12', NULL),
(5, 4, 2, 'KIDS-2604', 'Phòng Smart Kids (Tầng 1)', 'Chiều Thứ 7 - Chủ Nhật (14:30 - 16:30)', '2026-09-19', 'upcoming', '2026-08-23 04:35:12', '2026-08-23 04:35:12', NULL),
(6, 5, 2, 'BIZ-2605', 'Phòng VIP 1 (Tầng 2)', 'Tối Thứ 2 - 4 - 6 (19:45 - 21:15)', '2026-09-21', 'upcoming', '2026-08-23 04:35:12', '2026-08-23 04:35:12', NULL);
INSERT INTO `course_registrations` (`id`, `course_id`, `full_name`, `email`, `phone`, `note`, `status`, `reject_reason`, `created_at`, `updated_at`, `assigned_to`, `follow_up_date`, `source`, `referred_by_code`) VALUES
(1, 1, 'Test User', 'test@example.com', '0900000000', 'test', 'approved', 'Học viên không phản hồi sau 3 lần liên hệ', '2026-08-30 07:37:47', '2026-09-06 04:58:01', NULL, NULL, 'other', NULL),
(4, 1, 'Nguyen Van Test QA', 'qa-test@example.com', '0911222333', NULL, 'pending', NULL, '2026-09-20 03:37:26', '2026-09-20 03:37:26', NULL, NULL, 'other', NULL);
INSERT INTO `courses` (`id`, `code`, `title`, `description`, `tuition_fee`, `duration_months`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'IELTS-INTENSIVE', 'Luyện Thi IELTS Bứt Phá 6.5+', 'Khóa học chuyên sâu trang bị đầy đủ chiến thuật làm bài 4 kỹ năng Nghe - Nói - Đọc - Viết, cam kết đầu ra tối thiểu 6.5.', '5500000.00', 4, 1, '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(2, 'TOEIC-MASTERY', 'Luyện Thi TOEIC 4 Kỹ Năng 750+', 'Trọng tâm mở rộng vốn từ vựng học thuật, mẹo bắt key Nghe và hoàn thiện cấu trúc ngữ pháp đọc hiểu chuyên ngành kinh tế.', '3800000.00', 3, 1, '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(3, 'COMM-PRO', 'Tiếng Anh Giao Tiếp Thực Chiến', 'Khóa học phản xạ nhanh theo các chủ đề đời sống, công sở và thuyết trình thực tế với 100% môi trường tương tác năng động.', '2900000.00', 2, 1, '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(4, 'KIDS-STARTER', 'Tiếng Anh Thiếu Nhi Toàn Diện', 'Chương trình phát triển ngữ âm tự nhiên qua hình ảnh, trò chơi và truyện kể sinh động dành cho các bé từ 6-11 tuổi.', '2400000.00', 3, 1, '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(5, 'BUSINESS-ENG', 'Tiếng Anh Doanh Nghiệp & Đàm Phán', 'Chương trình viết email thương mại, báo cáo tài chính và đàm phán hợp đồng cho người đi làm.', '4200000.00', 3, 1, '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(6, 'VSTEP-B2', 'Luyện Thi Chuẩn B2/VSTEP Cấp Tốc', 'Lộ trình tối ưu cho sinh viên chuẩn bị tốt nghiệp và giáo viên cần hoàn thiện chuẩn B2.', '3500000.00', 2, 1, '2026-08-23 04:35:12', '2026-08-23 04:35:12');
INSERT INTO `enrollments` (`id`, `student_id`, `class_id`, `status`, `created_at`, `updated_at`, `deleted_at`, `discount_amount`, `voucher_id`) VALUES
(1, 3, 1, 'completed', '2026-08-30 07:39:21', '2026-08-30 08:31:51', NULL, '1050000.00', 1),
(4, 3, 2, 'active', '2026-08-30 08:32:13', '2026-09-06 04:55:19', NULL, '0.00', NULL);
INSERT INTO `exam_choices` (`id`, `question_id`, `choice_text`, `is_correct`, `order_index`) VALUES
(1, 1, 'Xin chao', 1, 0),
(2, 1, 'Tam biet', 0, 1),
(3, 1, 'Cam on', 0, 2),
(4, 2, 'Cai ban', 0, 0),
(5, 2, 'Cuon sach', 1, 1),
(6, 2, 'Cai ghe', 0, 2),
(11, 5, 'Ha Noi', 1, 0),
(12, 5, 'Sai Gon', 0, 1);
INSERT INTO `exam_questions` (`id`, `exam_id`, `question_text`, `score`, `order_index`) VALUES
(1, 1, 'Tu \'Hello\' nghia la gi?', '5.00', 0),
(2, 1, 'Tu \'Book\' nghia la gi?', '5.00', 1);
INSERT INTO `exam_submissions` (`id`, `exam_id`, `student_id`, `score`, `submitted_at`) VALUES
(1, 1, 3, '5.00', '2026-08-30 08:31:14');
INSERT INTO `exams` (`id`, `course_id`, `title`, `description`, `duration_minutes`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Kiem tra tu vung Unit 1', 'Bai kiem tra trac nghiem', 15, 1, '2026-08-30 08:30:54', '2026-08-30 08:30:54');
INSERT INTO `grades` (`id`, `enrollment_id`, `title`, `score`, `teacher_comment`, `created_at`, `updated_at`) VALUES
(1, 1, 'Giua ky', '8.50', NULL, '2026-08-30 07:40:25', '2026-08-30 07:40:25'),
(2, 1, 'Cuoi ky', '9.00', NULL, '2026-08-30 08:16:37', '2026-08-30 08:16:37');

INSERT INTO `lessons` (`id`, `course_id`, `lesson_number`, `title`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Tổng quan IELTS & Listening Section 1', 'Chiến lược làm bài nghe dạng Form / Note Completion và bẫy phát âm.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(2, 1, 2, 'Reading: Skimming & Scanning Foundation', 'Phương pháp đọc lướt tìm ý chính và định vị từ khóa trong bài đọc dài.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(3, 1, 3, 'Speaking Part 1: Fluency & Topic Vocabulary', 'Xây dựng câu trả lời tự nhiên cho các chủ đề: Study, Work, Hobbies.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(4, 1, 4, 'Writing Task 1: Line Graph & Bar Chart', 'Cấu trúc bài viết phân tích biểu đồ đường và cột chuẩn band 7.0.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(5, 1, 5, 'Listening Section 2: Map & Flow-chart Labeling', 'Phương pháp nhận biết phương hướng và từ nối định vị không gian.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(6, 1, 6, 'Writing Task 2: Opinion Essay Structure', 'Phương pháp lập dàn bài, viết mở bài trực diện và liên kết các đoạn thân bài.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(7, 2, 1, 'Listening Part 1 & 2: Phản xạ nhanh', 'Phương pháp phân tích hình ảnh và bẫy đồng âm trong câu hỏi ngắn.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(8, 2, 2, 'Reading Part 5: Chủ điểm Từ loại & Thì động từ', 'Tổng hợp cấu trúc ngữ pháp then chốt giúp giải nhanh Part 5.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(9, 2, 3, 'Listening Part 3: Short Conversations', 'Kỹ thuật đọc trước câu hỏi và dự đoán ngữ cảnh hội thoại văn phòng.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(10, 2, 4, 'Reading Part 7: Đọc hiểu văn bản đơn', 'Cách xử lý nhanh email, thông báo nội bộ và quảng cáo sản phẩm.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(11, 3, 1, 'Ice-breaking & Daily Conversation', 'Luyện ngữ điệu chào hỏi, giới thiệu bản thân và hỏi thăm tự nhiên.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(12, 3, 2, 'Travel & Dining Out Expressions', 'Phản xạ đặt món tại nhà hàng, hỏi đường và thủ tục tại sân bay.', '2026-08-23 04:35:12', '2026-08-23 04:35:12'),
(13, 3, 3, 'Workplace Communication & Small Talk', 'Giao tiếp công sở, thảo luận công việc hàng ngày và đặt lịch hẹn.', '2026-08-23 04:35:12', '2026-08-23 04:35:12');
INSERT INTO `payments` (`id`, `enrollment_id`, `amount_paid`, `payment_method`, `payment_date`, `note`, `created_at`) VALUES
(1, 1, '2000000.00', 'cash', '2026-08-30 07:39:32', 'Dot 1', '2026-08-30 07:39:32'),
(2, 1, '500000.00', 'cash', '2026-09-05 14:03:36', 'Thu tiền mặt trực tiếp tại trung tâm', '2026-09-05 14:03:36'),
(3, 1, '100000.00', 'cash', '2026-09-20 03:23:14', 'Test thu tien - kiem tra chuc nang', '2026-09-20 03:23:14'),
(4, 4, '3800000.00', 'transfer', '2026-09-20 04:41:55', 'Xác nhận đã nhận chuyển khoản', '2026-09-20 04:41:55');
INSERT INTO `refunds` (`id`, `enrollment_id`, `amount`, `reason`, `refunded_at`, `created_at`) VALUES
(1, 1, '200000.00', 'Hoan mot phan do doi lich', '2026-08-30 08:12:56', '2026-08-30 08:12:56');
INSERT INTO `registration_notes` (`id`, `registration_id`, `created_by`, `note`, `created_at`) VALUES
(2, 1, 1, 'Đã gọi điện tư vấn, học viên hẹn suy nghĩ thêm.', '2026-09-05 13:44:56'),
(3, 1, 1, 'Ghi chú thứ 2 để test hiển thị tên', '2026-09-05 13:46:23');
INSERT INTO `reviews` (`id`, `student_id`, `class_id`, `rating`, `comment`, `created_at`) VALUES
(1, 3, 1, 5, 'Giao vien day rat tot', '2026-08-30 08:16:08');
INSERT INTO `rooms` (`id`, `name`, `capacity`, `note`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Phòng 1', 20, 'Gần thang máy', 1, '2026-08-30 07:37:08', '2026-08-30 07:37:08'),
(2, 'Phòng 2', NULL, NULL, 1, '2026-08-30 07:37:08', '2026-08-30 07:37:08'),
(3, 'Phòng 3', NULL, NULL, 1, '2026-08-30 07:37:08', '2026-08-30 07:37:08'),
(4, 'Phòng 4', NULL, NULL, 1, '2026-08-30 07:37:08', '2026-08-30 07:37:08'),
(5, 'Phòng 5', NULL, NULL, 1, '2026-08-30 07:37:08', '2026-08-30 07:37:08'),
(6, 'Phòng IELTS Lab (Tầng 2)', NULL, NULL, 1, '2026-08-30 07:38:23', '2026-08-30 07:38:23'),
(7, 'Phòng Studio A (Tầng 1)', NULL, NULL, 1, '2026-08-30 07:38:23', '2026-08-30 07:38:23'),
(8, 'Phòng Hội Thảo (Tầng 3)', NULL, NULL, 1, '2026-08-30 07:38:23', '2026-08-30 07:38:23'),
(9, 'Phòng Smart Kids (Tầng 1)', NULL, NULL, 1, '2026-08-30 07:38:24', '2026-08-30 07:38:24'),
(10, 'Phòng VIP 1 (Tầng 2)', NULL, NULL, 1, '2026-08-30 07:38:24', '2026-08-30 07:38:24'),
(11, 'Phòng Test Tiếng Việt', NULL, NULL, 0, '2026-08-30 07:38:43', '2026-08-30 07:38:43');
INSERT INTO `student_details` (`id`, `user_id`, `student_code`, `dob`, `parent_name`, `parent_phone`, `created_at`, `updated_at`) VALUES
(1, 3, 'HV-2026-0001', '2007-05-12', 'Trần Văn Chiến', '0912999888', '2026-08-23 04:35:12', '2026-09-06 04:17:40'),
(2, 4, 'HV-2026-0002', '2002-11-20', 'Bùi Văn Thanh', '0913723282', '2026-08-23 04:35:12', '2026-08-23 04:35:12');
INSERT INTO `submission_answers` (`id`, `submission_id`, `question_id`, `choice_id`) VALUES
(1, 1, 1, 1),
(2, 1, 2, 4);
INSERT INTO `teacher_details` (`id`, `user_id`, `specialization`, `degree`, `bio`, `created_at`, `updated_at`, `rate_per_session`) VALUES
(1, 2, 'IELTS 8.5 & Giao tiếp phản xạ', 'Thạc sĩ TESOL - ĐH Ngoại Ngữ', 'Giảng viên trưởng với hơn 8 năm kinh nghiệm giảng dạy và luyện thi chứng chỉ quốc tế Cambridge, IELTS.', '2026-08-23 04:35:12', '2026-09-01 06:25:22', '350000.00');
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `codeChangePass`, `phone`, `avatar_url`, `role`, `status`, `refresh_token`, `created_at`, `updated_at`, `codeChangePass_attempts`, `codeChangePass_expires_at`, `referral_code`) VALUES
(1, 'Quản Trị Viên (Admin)', 'admin@xuanloc.edu.vn', '$2b$10$iKNvQGYIS6JJruoQ334rgegqerONXgpW/h/5zJLVlIel8GKUHiXWO', NULL, '0901234567', 'https://res.cloudinary.com/demo/image/upload/v1/avatar-admin.png', 'admin', 'active', NULL, '2026-08-08 03:06:44', '2026-09-20 04:53:19', 0, NULL, NULL),
(2, 'Nguyễn Văn A (Updated)', 'teacher@xuanloc.edu.vn', '$2b$10$iKNvQGYIS6JJruoQ334rgegqerONXgpW/h/5zJLVlIel8GKUHiXWO', NULL, '0908765432', '/uploads/avatars/Avatar-1786165440204-875436939.jpg', 'teacher', 'active', NULL, '2026-08-08 03:06:44', '2026-09-20 04:52:59', 0, NULL, NULL),
(3, 'Trần Thị B (Học viên)', 'student@xuanloc.edu.vn', '$2b$10$vyKjuS1bpm01.C.fXH4bN.sKVFckJjKOf9dgDBCo6dAZGk589XFHW', NULL, '0912345678', 'https://res.cloudinary.com/demo/image/upload/v1/avatar-student.png', 'student', 'active', NULL, '2026-08-08 03:06:44', '2026-09-20 04:38:24', 0, NULL, NULL),
(4, 'Bùi Văn Tuấn Lâm', 'dantethegodslayer2000@gmail.com', '$2b$10$PaExZg.mRgM2jyFXYBuEQeMJwA0AgJsVNqdHi6CHhRz.EGMfAM0Da', NULL, '0367797348', '/uploads/avatars/Avatar-1786166256701.jpg', 'student', 'active', NULL, '2026-08-08 04:25:59', '2026-08-08 05:17:36', 0, NULL, NULL);
INSERT INTO `vouchers` (`id`, `code`, `discount_type`, `discount_value`, `max_uses`, `used_count`, `valid_from`, `valid_to`, `is_active`, `created_at`) VALUES
(1, 'WELCOME10', 'percent', '10.00', 1, 1, NULL, NULL, 1, '2026-08-30 08:31:51'),
(2, 'TEST-VOUCHER', 'fixed', '200000.00', NULL, 0, NULL, NULL, 0, '2026-09-01 06:01:19');



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;