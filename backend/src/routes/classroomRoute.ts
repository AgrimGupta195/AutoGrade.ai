import { Request, Response, Router } from 'express';
import requireJwt from '../middlewares/requireJwt';
import { getClassroomClient, GoogleAuthError } from '../services/GoogleClassroomService';
import { User } from 'database/models/userModel';

const router = Router();
router.get('/courses', requireJwt, async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const classroom = getClassroomClient(user);
    const response = await classroom.courses.list({
      pageSize: 50,
      courseStates: ['ACTIVE'],
    });
    return res.status(200).json({
      courses: response.data.courses || [],
      nextPageToken: response.data.nextPageToken || null,
    });
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      return res.status(error.code).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: 'Failed to fetch Google Classroom courses.',
      error,
    });
  }
});
// router.get('/announcements/:googleCourseId', requireJwt, async (req: Request, res: Response) => {
//   try {
//     const user = req.user as User;
//     const googleCourseId = Array.isArray(req.params.googleCourseId)
//       ? req.params.googleCourseId[0]
//       : req.params.googleCourseId;

//     const classroom = getClassroomClient(user);
//     const queryParams: any = {
//       courseId: googleCourseId,
//       pageSize: 50,
//     };
//     if (req.query.pageToken) {
//       queryParams.pageToken = req.query.pageToken;
//     }

//     const response = await classroom.courses.announcements.list(queryParams as any);

//     const announcements = (response as any).data.announcements || [];

//     return res.status(200).json({
//       announcements,
//       nextPageToken: (response as any).data.nextPageToken || null,
//     });
//   } catch (error) {
//     if (error instanceof GoogleAuthError) {
//       return res.status(error.code).json({
//         message: error.message,
//       });
//     }
//     return res.status(500).json({
//       message: 'Failed to fetch Google Classroom announcements.',
//       error,
//     });
//   }
// });
router.get('/coursework/:courseId',requireJwt, async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const courseId = req.params.courseId;
    const classroom = getClassroomClient(user);
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;
    const courseWorkStatesQuery = req.query.courseWorkStates;
    const courseWorkStates = Array.isArray(courseWorkStatesQuery)
      ? courseWorkStatesQuery
      : typeof courseWorkStatesQuery === 'string'
      ? courseWorkStatesQuery.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const queryParams: any = {
      courseId,
      pageSize,
    };

    if (req.query.pageToken) {
      queryParams.pageToken = req.query.pageToken;
    }
    if (req.query.orderBy) {
      queryParams.orderBy = req.query.orderBy;
    }
    if (courseWorkStates && courseWorkStates.length > 0) {
      queryParams.courseWorkStates = courseWorkStates;
    }
    if (req.query.previewVersion) {
      queryParams.previewVersion = req.query.previewVersion;
    }

    const response = await classroom.courses.courseWork.list(queryParams as any);

    const courseWork = (response as any).data.courseWork || [];
    return res.status(200).json({
      courseWork,
      nextPageToken: (response as any).data.nextPageToken || null,
    });
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      return res.status(error.code).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: 'Failed to fetch Google Classroom course work.',
      error,
    });
  }
});

router.get('/coursework/:courseId/:courseWorkId/submissions', requireJwt, async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const courseId = req.params.courseId;
    const courseWorkId = req.params.courseWorkId;
    const classroom = getClassroomClient(user);

    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;
    const statesQuery = req.query.states;
    const states = Array.isArray(statesQuery)
      ? statesQuery
      : typeof statesQuery === 'string'
      ? statesQuery.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const queryParams: any = {
      courseId,
      courseWorkId,
      pageSize,
    };

    if (req.query.pageToken) {
      queryParams.pageToken = req.query.pageToken;
    }
    if (states && states.length > 0) {
      queryParams.states = states;
    }
    if (req.query.late !== undefined) {
      queryParams.late = req.query.late;
    }
    if (req.query.previewVersion) {
      queryParams.previewVersion = req.query.previewVersion;
    }

    const response = await classroom.courses.courseWork.studentSubmissions.list(queryParams as any);

    const studentSubmissions = (response as any).data.studentSubmissions || [];
    return res.status(200).json({
      studentSubmissions,
      nextPageToken: (response as any).data.nextPageToken || null,
    });
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      return res.status(error.code).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: 'Failed to fetch Google Classroom student submissions.',
      error,
    });
  }
});

export default router;