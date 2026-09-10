require('mocha-sinon');
const chai = require('chai');
const expect = chai.expect;

const app = require('../src/app');
const gameState = require('../src/league');
const leagueRenderer = require('../src/league_renderer');
const fileService = require('../src/file_service');
const InvalidArgumentException = require('../src/invalid_argument_exception');

describe('app command processing', function () {
  it('prints the current state of the league', function () {
    const league = gameState.createLeague();
    const renderLeague = this.sinon.stub(leagueRenderer, 'render');
    renderLeague.withArgs(league).returns('rendered league');

    const game = app.startGame(league);
    expect(game.sendCommand('print')).to.equal('rendered league');
  });

  describe('add player', function () {
    it('forwards the name to the league', function () {
      const league = { addPlayer: function () {} };
      const mockLeague = this.sinon.mock(league);
      mockLeague.expects('addPlayer').withArgs('Alice');

      const game = app.startGame(league);
      game.sendCommand('add player Alice');

      mockLeague.verify();
    });

    it('returns the league error message when addPlayer throws InvalidArgumentException', function () {
      const league = { addPlayer: function () {} };
      this.sinon.stub(league, 'addPlayer').throws(new InvalidArgumentException('Cannot add player Alice because they are already in the game'));

      const game = app.startGame(league);
      const result = game.sendCommand('add player Alice');

      expect(result).to.equal('Cannot add player Alice because they are already in the game');
    });
  });

  describe('record win', function () {
    it('forwards winner and loser to the league', function () {
      const league = { recordWin: function () {} };
      const mockLeague = this.sinon.mock(league);
      mockLeague.expects('recordWin').withArgs('Alice', 'Bob');

      const game = app.startGame(league);
      game.sendCommand('record win Alice Bob');

      mockLeague.verify();
    });

    it('returns the league error message when recordWin throws InvalidArgumentException', function () {
      const league = { recordWin: function () {} };
      this.sinon.stub(league, 'recordWin').throws(new InvalidArgumentException('Cannot record match result. Winner \'Bob\' must be one row below loser \'Alice\''));

      const game = app.startGame(league);
      const result = game.sendCommand('record win Bob Alice');

      expect(result).to.equal('Cannot record match result. Winner \'Bob\' must be one row below loser \'Alice\'');
    });
  });

  describe('winner', function () {
    it('returns the stubbed winner name', function () {
      const league = { getWinner: function () {} };
      this.sinon.stub(league, 'getWinner').returns('Alice');

      const game = app.startGame(league);
      expect(game.sendCommand('winner')).to.equal('Alice');
    });

    it('returns null when the league has no winner', function () {
      const league = { getWinner: function () {} };
      this.sinon.stub(league, 'getWinner').returns(null);

      const game = app.startGame(league);
      expect(game.sendCommand('winner')).to.be.null;
    });
  });

  describe('save', function () {
    it('asks the file service to save this league', function () {
      const league = gameState.createLeague();
      const mockFileService = this.sinon.mock(fileService);
      mockFileService.expects('save').withArgs('some/file/path', league);

      const game = app.startGame(league);
      game.sendCommand('save some/file/path');

      mockFileService.verify();
    });

    it('returns the file-service error message when save throws InvalidArgumentException', function () {
      const league = gameState.createLeague();
      this.sinon.stub(fileService, 'save').throws(new InvalidArgumentException('Could not save file to some/file/path'));

      const game = app.startGame(league);
      const result = game.sendCommand('save some/file/path');

      expect(result).to.equal('Could not save file to some/file/path');
    });
  });

  describe('load', function () {
    it('loads from the given path and uses the returned league afterwards', function () {
      const league = gameState.createLeague();
      const loadedLeague = { getWinner: function () { return 'LoadedWinner'; } };
      const mockFileService = this.sinon.mock(fileService);
      mockFileService.expects('load').withArgs('some/file/path').returns(loadedLeague);

      const game = app.startGame(league);
      game.sendCommand('load some/file/path');

      mockFileService.verify();
      expect(game.sendCommand('winner')).to.equal('LoadedWinner');
    });

    it('returns the file-service error message when load throws InvalidArgumentException', function () {
      const league = gameState.createLeague();
      this.sinon.stub(fileService, 'load').throws(new InvalidArgumentException('Could not load file from some/file/path'));

      const game = app.startGame(league);
      const result = game.sendCommand('load some/file/path');

      expect(result).to.equal('Could not load file from some/file/path');
    });
  });

  describe('other commands', function () {
    it('returns an unknown command message', function () {
      const league = gameState.createLeague();
      const game = app.startGame(league);

      expect(game.sendCommand('bananas')).to.equal('Unknown command "bananas"');
    });

    it('rethrows errors that are not InvalidArgumentException', function () {
      const league = { addPlayer: function () {} };
      this.sinon.stub(league, 'addPlayer').throws(new Error('something went wrong'));

      const game = app.startGame(league);

      expect(() => game.sendCommand('add player Alice')).to.throw('something went wrong');
    });
  });
});