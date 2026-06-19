import mongoose from "mongoose";
import Course from "../course/entity";
import Section from "../course/section/entity";
import CurriculumItem from "../course/curriculum-item/entity";
import { CurriculumItemType } from "../course/enum";

const curriculumData: {
  [key: string]: {
    sections: {
      title: string;
      description?: string;
      items: {
        title: string;
        description?: string;
        type: string;
        videoUrl?: string;
        videoDuration?: number;
        content?: string;
      }[];
    }[];
  };
} = {
  "complete-web-development-masterclass": {
    sections: [
      {
        title: "HTML & CSS Fundamentals",
        description: "Learn the basics of web development",
        items: [
          {
            title: "Introduction to HTML",
            description: "Learn the fundamentals of HTML markup language and how to structure web pages properly.",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 1200,
          },
          {
            title: "HTML Best Practices",
            type: CurriculumItemType.Article,
            content: "Learn semantic HTML, accessibility, and SEO best practices for modern web development.",
          },
          {
            title: "CSS Styling Basics",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 1500,
          },
          {
            title: "HTML & CSS Quiz",
            type: CurriculumItemType.Quiz,
          },
        ],
      },
      {
        title: "JavaScript Essentials",
        description: "Master JavaScript fundamentals",
        items: [
          {
            title: "JavaScript Variables and Types",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 1800,
          },
          {
            title: "Functions and Scope",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 2100,
          },
          {
            title: "JavaScript Quiz",
            type: CurriculumItemType.Quiz,
          },
        ],
      },
    ],
  },
  "data-science-machine-learning-bootcamp": {
    sections: [
      {
        title: "Python Basics",
        description: "Get started with Python for data science",
        items: [
          {
            title: "Python Setup and Environment",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 900,
          },
          {
            title: "NumPy and Pandas Basics",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 2400,
          },
          {
            title: "Data Manipulation Exercise",
            type: CurriculumItemType.Article,
            content: "Practice data manipulation using pandas DataFrames.",
          },
        ],
      },
      {
        title: "Machine Learning Algorithms",
        description: "Learn core ML algorithms",
        items: [
          {
            title: "Linear Regression",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 2700,
          },
          {
            title: "Classification Algorithms",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 3000,
          },
          {
            title: "ML Quiz",
            type: CurriculumItemType.Quiz,
          },
        ],
      },
    ],
  },
  "uiux-design-fundamentals": {
    sections: [
      {
        title: "Design Thinking",
        description: "Understand design thinking methodology",
        items: [
          {
            title: "Design Thinking Overview",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 1500,
          },
          {
            title: "User Research Methods",
            type: CurriculumItemType.Article,
            content: "Learn various user research techniques including interviews, surveys, and usability testing.",
          },
        ],
      },
      {
        title: "Figma Mastery",
        description: "Master Figma design tool",
        items: [
          {
            title: "Figma Basics",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 1800,
          },
          {
            title: "Creating Wireframes",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 2100,
          },
          {
            title: "Prototyping in Figma",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 2400,
          },
        ],
      },
    ],
  },
  "cloud-infrastructure-with-aws": {
    sections: [
      {
        title: "AWS Fundamentals",
        description: "Get started with Amazon Web Services",
        items: [
          {
            title: "AWS Overview",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 1200,
          },
          {
            title: "Setting Up AWS Account",
            type: CurriculumItemType.Article,
            content: "Step-by-step guide to creating and configuring your AWS account with IAM best practices.",
          },
          {
            title: "EC2 Instances",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 2000,
          },
        ],
      },
      {
        title: "Storage and Databases",
        description: "Learn S3 and RDS",
        items: [
          {
            title: "S3 Storage",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 1800,
          },
          {
            title: "RDS Databases",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 2200,
          },
          {
            title: "AWS Quiz",
            type: CurriculumItemType.Quiz,
          },
        ],
      },
    ],
  },
  "mobile-app-development-with-react-native": {
    sections: [
      {
        title: "React Native Setup",
        description: "Set up your React Native environment",
        items: [
          {
            title: "Environment Setup",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 1500,
          },
          {
            title: "Your First React Native App",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 2000,
          },
        ],
      },
      {
        title: "Core Components",
        description: "Learn React Native components",
        items: [
          {
            title: "View, Text, and ScrollView",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 1800,
          },
          {
            title: "FlatList and Performance",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 2100,
          },
          {
            title: "Navigation Setup",
            type: CurriculumItemType.Lecture,
            videoUrl: "https://vimeo.com/696055089",
            videoDuration: 2400,
          },
        ],
      },
    ],
  },
};

export const seedCurriculum = async () => {
  try {
    console.log("🔄 Seeding curriculum for courses...");

    for (const [slug, { sections }] of Object.entries(curriculumData)) {
      const course = await Course.findOne({ slug });

      if (!course) {
        console.log(`⚠️  Course not found: ${slug}`);
        continue;
      }

      console.log(`\n📚 Processing: ${course.title}`);

      for (let sectionOrder = 0; sectionOrder < sections.length; sectionOrder++) {
        const sectionData = sections[sectionOrder];

        // Create section
        const section = await Section.create({
          courseId: course._id,
          title: sectionData.title,
          description: sectionData.description,
          order: sectionOrder + 1,
        });

        console.log(`  ✓ Section: ${section.title}`);

        // Create curriculum items
        for (let itemOrder = 0; itemOrder < sectionData.items.length; itemOrder++) {
          const itemData = sectionData.items[itemOrder];

          // Fallback description if not provided
          const description = itemData.description || `Complete this lesson: ${itemData.title}`;

          const item = await CurriculumItem.create({
            sectionId: section._id,
            title: itemData.title,
            description,
            type: itemData.type,
            videoUrl: itemData.videoUrl,
            videoDuration: itemData.videoDuration,
            content: itemData.content,
            order: itemOrder + 1,
          });

          console.log(`    ✓ ${itemData.type}: ${item.title}`);
        }
      }
    }

    console.log("\n✅ Curriculum seeding complete!");
  } catch (error) {
    console.log("❌ Error seeding curriculum:", error);
    throw error;
  }
};

if (require.main === module) {
  mongoose
    .connect(process.env.DATABASE_URL || "mongodb://localhost:27017/metricmind")
    .then(() => seedCurriculum())
    .then(() => mongoose.connection.close())
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
}
