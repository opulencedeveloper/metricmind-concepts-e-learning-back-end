import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { courseService } from "../course/service";
import { sectionService } from "../course/section/service";
import { curriculumItemService } from "../course/curriculum-item/service";
import { quizService } from "../course/quiz/service";
import { CourseLevel, Language, Currency, CurriculumItemType } from "../course/enum";
import { QuestionType } from "../course/quiz/enum";
import Admin from "../admin/entity";
import Logging from "../utils/loggin";

const seedCourses = async () => {
  try {
    await connectDB();
    Logging.info("Database connected");

    // Get or create admin user for courses
    let admin = await Admin.findOne({ email: "admin@metricmind.com" });

    if (!admin) {
      Logging.error("Admin user not found. Please run seed-admin.ts first");
      process.exit(1);
    }

    // Check if courses already exist
    const Course = require("../course/entity").default;
    const existingCourses = await Course.countDocuments();

    if (existingCourses > 0) {
      Logging.info(`Courses already exist (${existingCourses} found). Skipping seeding.`);
      process.exit(0);
    }

    const coursesData = [
      {
        title: "Web Development Fundamentals",
        description: "Learn the basics of HTML, CSS, and JavaScript to build modern web applications. Perfect for beginners.",
        instructor: "Sarah Chen",
        instructorBio: "Full-stack developer with 10+ years of experience",
        category: "Web Development",
        subcategory: "Frontend",
        level: CourseLevel.Beginner,
        price: 4999,
        currency: Currency.NGN,
        thumbnail: "https://via.placeholder.com/400x225?text=Web+Development",
        learningObjectives: [
          "Understand HTML structure and semantics",
          "Master CSS styling and layouts",
          "Write interactive JavaScript code",
          "Build responsive websites",
        ],
        requirements: ["Basic computer literacy", "A text editor"],
      },
      {
        title: "Advanced JavaScript & ES6+",
        description: "Master modern JavaScript features including async/await, promises, and functional programming concepts.",
        instructor: "John Smith",
        instructorBio: "JavaScript expert and open-source contributor",
        category: "Web Development",
        subcategory: "JavaScript",
        level: CourseLevel.Intermediate,
        price: 7999,
        currency: Currency.NGN,
        thumbnail: "https://via.placeholder.com/400x225?text=JavaScript+Advanced",
        learningObjectives: [
          "Master ES6+ syntax and features",
          "Understand closures and scope",
          "Work with async/await and promises",
          "Apply functional programming patterns",
        ],
        requirements: ["Basic JavaScript knowledge", "Familiarity with DOM basics"],
      },
      {
        title: "React.js Complete Guide",
        description: "Build modern single-page applications with React. Learn hooks, state management, and component design patterns.",
        instructor: "Emma Wilson",
        instructorBio: "React specialist building production apps at scale",
        category: "Web Development",
        subcategory: "React",
        level: CourseLevel.Intermediate,
        price: 9999,
        currency: Currency.NGN,
        thumbnail: "https://via.placeholder.com/400x225?text=React+Guide",
        learningObjectives: [
          "Build component-based UIs",
          "Master React hooks",
          "Manage state effectively",
          "Handle side effects with useEffect",
        ],
        requirements: ["JavaScript proficiency", "Understanding of ES6"],
      },
      {
        title: "Node.js & Express Backend Development",
        description: "Create scalable backend applications with Node.js and Express. Learn REST APIs, authentication, and databases.",
        instructor: "Michael Johnson",
        instructorBio: "Backend engineer with cloud infrastructure expertise",
        category: "Backend Development",
        subcategory: "Node.js",
        level: CourseLevel.Intermediate,
        price: 8999,
        currency: Currency.NGN,
        thumbnail: "https://via.placeholder.com/400x225?text=Node.js+Express",
        learningObjectives: [
          "Build RESTful APIs",
          "Implement authentication & authorization",
          "Work with databases",
          "Handle errors and validation",
        ],
        requirements: ["JavaScript knowledge", "Basic understanding of HTTP"],
      },
      {
        title: "Full Stack Development Masterclass",
        description: "Complete end-to-end web development. Build, deploy, and scale full-stack applications from scratch.",
        instructor: "Alex Rodriguez",
        instructorBio: "Startup founder and full-stack engineer",
        category: "Web Development",
        subcategory: "Full Stack",
        level: CourseLevel.Advanced,
        price: 14999,
        currency: Currency.NGN,
        thumbnail: "https://via.placeholder.com/400x225?text=Full+Stack",
        learningObjectives: [
          "Build complete web applications",
          "Implement user authentication",
          "Design and optimize databases",
          "Deploy to production",
          "Monitor and scale applications",
        ],
        requirements: [
          "JavaScript and React knowledge",
          "Node.js basics",
          "Understanding of databases",
        ],
      },
    ];

    // Create courses with sections and curriculum items
    for (const courseData of coursesData) {
      Logging.info(`Creating course: ${courseData.title}`);

      const course = await courseService.createCourse({
        ...courseData,
        adminId: admin._id,
      });

      // Create 3 sections per course
      const sectionTitles = ["Introduction & Setup", "Core Concepts", "Advanced Topics"];

      for (let i = 0; i < sectionTitles.length; i++) {
        const section = await sectionService.createSection({
          courseId: course._id,
          title: sectionTitles[i],
          description: `Learn about ${sectionTitles[i].toLowerCase()}`,
          order: i + 1,
        });

        // Add curriculum items to section
        // 1. Lecture video
        await curriculumItemService.createCurriculumItem({
          sectionId: section._id,
          title: `Video Lecture: ${sectionTitles[i]}`,
          description: `Watch this comprehensive video about ${sectionTitles[i].toLowerCase()}`,
          type: CurriculumItemType.Lecture,
          order: 1,
          videoUrl: "https://videmo.com/video/example123",
          videoDuration: 1200 + i * 300, // 20min + varies by section
        });

        // 2. Article/Reading material
        await curriculumItemService.createCurriculumItem({
          sectionId: section._id,
          title: `Article: ${sectionTitles[i]} Deep Dive`,
          description: `Read this article for additional context`,
          type: CurriculumItemType.Article,
          order: 2,
          content: `<h2>${sectionTitles[i]}</h2><p>This is supplementary reading material about ${sectionTitles[i].toLowerCase()}. Students should read this after watching the lecture video.</p>`,
        });

        // 3. Quiz (required to progress)
        const curriculumItem = await curriculumItemService.createCurriculumItem({
          sectionId: section._id,
          title: `Quiz: ${sectionTitles[i]} Assessment`,
          description: `Test your knowledge with this quiz`,
          type: CurriculumItemType.Quiz,
          order: 3,
        });

        // Create actual quiz with questions
        await quizService.createQuiz({
          curriculumItemId: curriculumItem._id,
          sectionId: section._id,
          title: `${sectionTitles[i]} Quiz`,
          description: `Assessment for ${sectionTitles[i]}`,
          questions: [
            {
              question: `What is the primary focus of ${sectionTitles[i]}?`,
              questionType: QuestionType.MultipleChoice,
              options: [
                "Understanding fundamentals",
                "Building projects",
                "Advanced optimization",
                "Testing strategies",
              ],
              correctAnswer: 0,
              explanation: "The primary focus is to understand the core concepts.",
              points: 2,
            },
            {
              question: "Is this course suitable for beginners?",
              questionType: QuestionType.TrueFalse,
              options: ['True', 'False'],
              correctAnswer: 0,
              explanation: "Yes, this course is designed with beginners in mind.",
              points: 1,
            },
          ],
          passingScore: 60,
          timeLimit: 900, // 15 minutes
        });
      }

      // Publish the course
      await courseService.publishCourse(course._id);
      Logging.info(`Published course: ${courseData.title}`);
    }

    Logging.info("✅ Course seeding completed successfully!");
    console.log(`\n📚 Created ${coursesData.length} courses with sections and quizzes`);
    process.exit(0);
  } catch (error: any) {
    Logging.error(`Course seeding failed: ${error.message}`);
    console.log(error);
    process.exit(1);
  }
};

seedCourses();
