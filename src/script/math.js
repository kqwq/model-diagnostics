






function getResiduals(data, model) {
  let res = []
  for (let [x, y] of data) {
    res.push([x, y - x])
  }
}