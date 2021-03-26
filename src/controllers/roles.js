import response from '@response';
import { getRemarks } from '../helpers/getRemarks';

export const checkSubmission = async (req, res, next) => {
  try {
    const { firstStudentName, secondStudentName } = req.body;
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).json({ error: 'No files were uploaded.' });
      return;
    }
    const firstAssignment = req.files.firstStudentFile.data
      .toString('utf8')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .toLowerCase();
    const secondAssignment = req.files.secondStudentFile.data
      .toString('utf8')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .toLowerCase();

    const remarks = await getRemarks(
      firstAssignment,
      secondAssignment,
      firstStudentName,
      secondStudentName
    );

    return response(res, 200, remarks);
  } catch (error) {
    return response(res, 400, error.message);
  }
};
