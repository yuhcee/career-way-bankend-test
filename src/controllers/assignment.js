import response from '@response';
import { compareFiles } from '../helpers/compare';
import { getRemarks } from '../helpers/getRemarks';
import {
  storeAssignmentDetails,
  viewAllAssignments,
  viewAssignment,
} from '../services/assignment';

export const checkSubmission = async (req, res, next) => {
  try {
    const { firstStudentName, secondStudentName } = req.body;
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).json({ error: 'No files were uploaded.' });
      return;
    }

    if ((firstStudentName === '', secondStudentName === '')) {
      return response(
        res,
        400,
        'firstStudentName or secondStudentName fields required'
      );
    }
    const firstStudentFile = req.files.firstStudentFile.data
      .toString('utf8')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .toLowerCase();
    const secondStudentFile = req.files.secondStudentFile.data
      .toString('utf8')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .toLowerCase();

    const remarks = await getRemarks(
      firstStudentFile,
      secondStudentFile,
      firstStudentName,
      secondStudentName
    );
    const percentageDifference = await compareFiles(
      firstStudentFile,
      secondStudentFile
    );

    // Save details to database(db)
    const isStored = await storeAssignmentDetails({
      firstStudentFile,
      secondStudentFile,
      firstStudentName,
      secondStudentName,
      percentageDifference,
      remarks,
    });

    if (isStored.status > 300) {
      return response(res, 400, isStored.message);
    }

    return response(res, 200, remarks);
  } catch (error) {
    return response(res, 400, error.message);
  }
};

export const getAllAssignments = async (req, res) => {
  const allAssignments = await viewAllAssignments();
  return response(res, 200, allAssignments);
};

export const getAssignment = async (req, res) => {
  const assignment = await viewAssignment(req.params.id);
  const {
    firstStudentFile,
    secondStudentFile,
    firstStudentName,
    secondStudentName,
  } = assignment;

  // Rerun program
  await getRemarks(
    firstStudentFile,
    secondStudentFile,
    firstStudentName,
    secondStudentName
  );
  return response(res, 200, assignment);
};
