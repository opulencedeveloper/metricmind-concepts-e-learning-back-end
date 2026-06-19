import mongoose from "mongoose";
import Course from "./entity";
import { ICreateCourseInput, IUpdateCourseInput } from "./interface";
import { CourseStatus } from "./enum";

class CourseService {
  public createCourse = async (input: ICreateCourseInput & { adminId: mongoose.Types.ObjectId }) => {
    const course = new Course({
      ...input,
      status: CourseStatus.Draft,
    });

    await course.save();
    return course;
  };

  public findCourseById = async (id: string | mongoose.Types.ObjectId) => {
    return await Course.findById(id);
  };

  public findCourseBySlug = async (slug: string) => {
    return await Course.findOne({ slug: slug.toLowerCase(), status: CourseStatus.Published });
  };

  public slugExists = async (slug: string, excludeId?: string | mongoose.Types.ObjectId) => {
    const query: any = { slug: slug.toLowerCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Course.findOne(query);
  };

  public findPublishedCourses = async (
    page: number = 1,
    limit: number = 12,
    category?: string,
    level?: string
  ) => {
    const skip = (page - 1) * limit;
    const query: any = { status: CourseStatus.Published };

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    return await Course.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  };

  public searchCourses = async (
    query: string,
    page: number = 1,
    limit: number = 12,
    category?: string
  ) => {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      // Stage 1: Text search filter (only published courses)
      {
        $match: {
          $text: { $search: query },
          status: CourseStatus.Published,
        },
      },
      // Stage 2: Add text score
      {
        $addFields: {
          textScore: { $meta: "textScore" },
        },
      },
      // Stage 3: Optional category filter
      ...(category ? [{ $match: { category } }] : []),
      // Stage 4: Calculate composite relevance score (at DB level)
      {
        $addFields: {
          relevanceScore: {
            $add: [
              // Text search relevance (weight: 1x)
              { $multiply: ["$textScore", 10] },
              // Popularity boost: rating score (weight: 1.5x)
              { $multiply: [{ $ifNull: ["$rating", 0] }, 15] },
              // Popularity boost: enrollment count (log scale to prevent domination)
              {
                $multiply: [
                  {
                    $ln: [
                      { $add: [{ $ifNull: ["$studentsEnrolled", 0] }, 1] },
                    ],
                  },
                  5,
                ],
              },
              // Freshness bonus (newer courses boost)
              {
                $max: [
                  {
                    $subtract: [
                      10,
                      {
                        $divide: [
                          {
                            $subtract: [
                              new Date(),
                              { $toDate: "$createdAt" },
                            ],
                          },
                          2592000000, // 30 days in milliseconds
                        ],
                      },
                    ],
                  },
                  0, // Ensure minimum 0
                ],
              },
            ],
          },
        },
      },
      // Stage 5: Sort by relevance (smart ranking)
      {
        $sort: {
          relevanceScore: -1,
          rating: -1, // Tiebreaker: higher rating
          studentsEnrolled: -1, // Tiebreaker: more enrolled
        },
      },
      // Stage 6: Pagination
      { $skip: skip },
      { $limit: limit },
      // Stage 7: Project final response (remove internal scoring fields)
      {
        $project: {
          textScore: 0,
          relevanceScore: 0,
        },
      },
    ];

    return await Course.aggregate(pipeline);
  };

  public findCoursesByAdmin = async (adminId: string | mongoose.Types.ObjectId) => {
    return await Course.find({ adminId }).sort({ createdAt: -1 });
  };

  public updateCourse = async (id: string | mongoose.Types.ObjectId, input: IUpdateCourseInput) => {
    return await Course.findByIdAndUpdate(id, input, { new: true });
  };

  public publishCourse = async (id: string | mongoose.Types.ObjectId) => {
    return await Course.findByIdAndUpdate(
      id,
      { status: CourseStatus.Published },
      { new: true }
    );
  };

  public unpublishCourse = async (id: string | mongoose.Types.ObjectId) => {
    return await Course.findByIdAndUpdate(
      id,
      { status: CourseStatus.Draft },
      { new: true }
    );
  };

  public updateStudentCount = async (courseId: string | mongoose.Types.ObjectId, increment: number = 1) => {
    return await Course.findByIdAndUpdate(
      courseId,
      { $inc: { studentsEnrolled: increment } },
      { new: true }
    );
  };

  public updateCourseRating = async (courseId: string | mongoose.Types.ObjectId, newRating: number) => {
    return await Course.findByIdAndUpdate(
      courseId,
      {
        $set: { rating: newRating },
        $inc: { reviewCount: 1 },
      },
      { new: true }
    );
  };

  public deleteCourse = async (id: string | mongoose.Types.ObjectId) => {
    return await Course.findByIdAndDelete(id);
  };
}

export const courseService = new CourseService();
