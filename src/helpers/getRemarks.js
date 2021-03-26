/**
 *
 * @param {String} firstAssignment - first assignment contents
 * @param {String} secondAssignment - second assignment contents
 * @param {String} firstStudentName - first student's name
 * @param {String} secondStudentName - second student's name
 * @returns {String} remarks - returns the comments
 */
export const getRemarks = async (
  firstAssignment,
  secondAssignment,
  firstStudentName,
  secondStudentName
) => {
  let remarks = '';
  const percentageDifference = await compareFiles(
    firstAssignment,
    secondAssignment
  );

  if (percentageDifference === 100) {
    remarks += `A 100% full matching between these assignments - "${firstAssignment}" and "${secondAssignment}" strongly suggests that "${firstStudentName}" and "${secondStudentName}" just photocopied each other.`;
  } else if (percentageDifference >= 70 && percentageDifference <= 99) {
    remarks += `With about 70% or more similarites between these assignments - "${firstAssignment}" and "${secondAssignment}". It strongly suggests that "${firstStudentName}" and "${secondStudentName}" must have copied each other.`;
  } else if (percentageDifference >= 60 && percentageDifference <= 69) {
    remarks += `With about 60% or more similarites between these assignments - "${firstAssignment}" and "${secondAssignment}". There is a slight indication that "${firstStudentName}" and "${secondStudentName}" may have copied each other's work.`;
  } else if (percentageDifference >= 50 && percentageDifference <= 59) {
    remarks += `With about 50% or more similarites between these assignments - "${firstAssignment}" and "${secondAssignment}". There is a slight chance that "${firstStudentName}" and "${secondStudentName}" may have or may not have copied each other's work.`;
  } else if (percentageDifference <= 40 && percentageDifference >= 10) {
    remarks += `With about 40% or less similarites between these assignments - "${firstAssignment}" and "${secondAssignment}". There is a little chance that "${firstStudentName}" and "${secondStudentName}" may have or may not have copied each other's work.`;
  } else {
    remarks += `No copies found between these assignments - "${firstAssignment}" and "${secondAssignment}". They are clearly two different solutions. There's no clear indication that "${firstStudentName}" and "${secondStudentName}" copied each other;`;
  }
  return remarks;
};
