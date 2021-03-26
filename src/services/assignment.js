import db from '@models';

export const storeAssignmentDetails = async (AssignmentInfo) => {
  try {
    const { firstStudentName, secondStudentName } = AssignmentInfo;
    // Check if record already exists
    const alreadyExists = await db.Assignment.findOne({
      where: {
        firstStudentName,
        secondStudentName,
      },
    });
    if (alreadyExists)
      return { error: true, message: 'Record already added.', status: 400 };
    // create assignment details
    await db.Assignment.create(AssignmentInfo);
  } catch (error) {
    return { message: error.message, status: 400 };
  }
};

export const viewAllAssignments = async () => {
  try {
    // View all assignments
    const allAssignments = await db.Assignment.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    });
    return allAssignments;
  } catch (error) {
    return { message: error.message, status: 400 };
  }
};

export const viewAssignment = async (id) => {
  try {
    //   check if id exists
    if (!id) {
      return { error: true, message: 'id is required', status: 400 };
    }
    // View all assignments
    const assignment = await db.Assignment.findOne({
      where: { id },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    });
    return assignment;
  } catch (error) {
    return { message: error.message, status: 400 };
  }
};
