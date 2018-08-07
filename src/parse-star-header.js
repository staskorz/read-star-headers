module.exports = content => {
  const rows = content.split("\n")

  if (rows.length < 8) {
    throw new Error("Star header contains less than 8 rows")
  }

  return rows
    .map(row => row.split("=").map(str => str.trim()))
    .filter(([key]) => !!key)
    .reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value,
      }),
      {},
    )
}
