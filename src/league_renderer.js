const maxNameLength = 17;
const boxWidth = maxNameLength + 2;
const boundary = '-'.repeat(boxWidth);
const emptyName = `|${' '.repeat(maxNameLength)}|`;

exports.render = function (league) {
  const rows = league.getPlayers();
  const rowCount = rows.length;

  if (rows.length > 0) {
    const boxes = rows.map((players, rowIndex) => {
      const maxPlayersInRow = rowIndex + 1;
      const rowBoundary = Array(maxPlayersInRow).fill(boundary).join(' ');

      const formattedNames = players.map(player => {
        return `|${formatName(player)}|`;
      });

      const rowsRemaining = rowCount - (rowIndex + 1);
      const paddingLength = rowsRemaining * Math.ceil(boxWidth / 2);
      const padding = ' '.repeat(paddingLength);

      const emptyNameCount = maxPlayersInRow - players.length;
      const emptyNames = Array(emptyNameCount).fill(emptyName);
        inaefbwejfvwe
      const allNames = formattedNames.concat(emptyNames);

      return (
`${padding}${rowBoundary}
${padding}${allNames.join(' ')}
${padding}${rowBoundary}`
      );
    });

    return boxes.join('\n');
  }

  return 'No players yet';
};

function formatName (name) {
  const nameLength = name.length;

  if (nameLength <= maxNameLength) {
    const pre_pad_spaces = Math.floor((maxNameLength - nameLength) / 2);
    const post_pad_spaces = Math.ceil((maxNameLength - nameLength) / 2);
    return `${' '.repeat(pre_pad_spaces)}${name}${' '.repeat(post_pad_spaces)}`;
  } else {
    return name.slice(0, maxNameLength - 3) + '...';
  }
}
