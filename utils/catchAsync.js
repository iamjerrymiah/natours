module.exports = fn => { //error handler to deal with catch block
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
