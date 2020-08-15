export default (...value) => {
  const cn = console;
  cn.log('-----------------');
  cn.log(...value);
  return cn.log('-----------------');
};
