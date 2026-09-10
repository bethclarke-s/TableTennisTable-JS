const chai = require('chai');
const expect = chai.expect;

const gameState = require('../src/league');
const InvalidArgumentException = require('../src/invalid_argument_exception');

describe('league', function () {
  describe('#addPlayer', function () {
    it('adds a player to the game', function () {
      const league = gameState.createLeague();
      league.addPlayer('Bob');

      const players = league.getPlayers();

      expect(players).to.have.lengthOf(1);
      expect(players[0]).to.have.members(['Bob']);
    });

    it('fills the current bottom row before opening a new one', function () {
      const league = gameState.createLeague();
      league.addPlayer('Alice');
      league.addPlayer('Bob');

      expect(league.getPlayers()).to.deep.equal([['Alice'], ['Bob']]);
    });

    it('opens a new bottom row when the current one is full', function () {
      const league = gameState.createLeague();
      league.addPlayer('Alice');
      league.addPlayer('Bob');
      league.addPlayer('Cara');

      expect(league.getPlayers()).to.deep.equal([['Alice'], ['Bob', 'Cara']]);
    });

    it('keeps the pyramid shape as the league grows', function () {
      const league = gameState.createLeague();
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach(name => league.addPlayer(name));

      expect(league.getPlayers()).to.deep.equal([['A'], ['B', 'C'], ['D', 'E', 'F']]);
    });

    it('rejects a duplicate name', function () {
      const league = gameState.createLeague();
      league.addPlayer('Bob');

      expect(() => league.addPlayer('Bob')).to.throw(InvalidArgumentException, /already in the game/);
    });

    it('rejects names with spaces', function () {
      const league = gameState.createLeague();

      expect(() => league.addPlayer('Alice Bob')).to.throw(InvalidArgumentException, /invalid characters/);
    });

    it('rejects names with other non-word characters', function () {
      const league = gameState.createLeague();

      expect(() => league.addPlayer('Bob!')).to.throw(InvalidArgumentException, /invalid characters/);
    });

    it('rejects an empty name', function () {
      const league = gameState.createLeague();

      expect(() => league.addPlayer('')).to.throw(InvalidArgumentException, /invalid characters/);
    });

    it('accepts letters, digits, and underscores', function () {
      const league = gameState.createLeague();
      league.addPlayer('Player_1');

      expect(league.getPlayers()).to.deep.equal([['Player_1']]);
    });
  });

  describe('#getPlayers', function () {
    it('returns no rows for an empty league', function () {
      const league = gameState.createLeague();

      expect(league.getPlayers()).to.deep.equal([]);
    });

    it('returns players grouped by row', function () {
      const league = gameState.createLeague();
      league.addPlayer('Alice');
      league.addPlayer('Bob');
      league.addPlayer('Cara');
      league.addPlayer('Dave');

      expect(league.getPlayers()).to.deep.equal([['Alice'], ['Bob', 'Cara'], ['Dave']]);
    });
  });

  describe('#recordWin', function () {
    function createThreePlayerLeague () {
      const league = gameState.createLeague();
      league.addPlayer('Alice');
      league.addPlayer('Bob');
      league.addPlayer('Cara');
      return league;
    }

    it('swaps winner and loser when the winner is one row below', function () {
      const league = createThreePlayerLeague();

      league.recordWin('Bob', 'Alice');

      expect(league.getPlayers()).to.deep.equal([['Bob'], ['Alice', 'Cara']]);
    });

    it('leaves other players in place', function () {
      const league = createThreePlayerLeague();

      league.recordWin('Bob', 'Alice');

      expect(league.getPlayers()[1]).to.have.members(['Alice', 'Cara']);
    });

    it('rejects a winner who is not in the league', function () {
      const league = createThreePlayerLeague();

      expect(() => league.recordWin('Zoe', 'Alice')).to.throw(InvalidArgumentException, /Player 'Zoe' is not in the game/);
    });

    it('rejects a loser who is not in the league', function () {
      const league = createThreePlayerLeague();

      expect(() => league.recordWin('Bob', 'Zoe')).to.throw(InvalidArgumentException, /Player 'Zoe' is not in the game/);
    });

    it('rejects a win on the same row', function () {
      const league = createThreePlayerLeague();

      expect(() => league.recordWin('Bob', 'Cara')).to.throw(InvalidArgumentException, /must be one row below/);
    });

    it('rejects a win when the winner is above the loser', function () {
      const league = createThreePlayerLeague();

      expect(() => league.recordWin('Alice', 'Bob')).to.throw(InvalidArgumentException, /must be one row below/);
    });

    it('rejects a win more than one row below', function () {
      const league = gameState.createLeague();
      ['Alice', 'Bob', 'Cara', 'Dave', 'Eve', 'Frank'].forEach(name => league.addPlayer(name));

      expect(() => league.recordWin('Dave', 'Alice')).to.throw(InvalidArgumentException, /must be one row below/);
    });
  });

  describe('#getWinner', function () {
    it('returns null for an empty league', function () {
      const league = gameState.createLeague();

      expect(league.getWinner()).to.be.null;
    });

    it('returns the single player as the winner', function () {
      const league = gameState.createLeague();
      league.addPlayer('Alice');

      expect(league.getWinner()).to.equal('Alice');
    });

    it('updates the winner after a successful challenge of the top player', function () {
      const league = gameState.createLeague();
      league.addPlayer('Alice');
      league.addPlayer('Bob');
      league.addPlayer('Cara');

      league.recordWin('Bob', 'Alice');

      expect(league.getWinner()).to.equal('Bob');
    });

    it('leaves the winner unchanged when a lower-row match is recorded', function () {
      const league = gameState.createLeague();
      ['Alice', 'Bob', 'Cara', 'Dave', 'Eve', 'Frank'].forEach(name => league.addPlayer(name));

      league.recordWin('Dave', 'Bob');

      expect(league.getWinner()).to.equal('Alice');
    });
  });
});