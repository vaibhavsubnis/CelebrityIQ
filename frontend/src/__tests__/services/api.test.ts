import { celebrityApi, dailyChallengeApi } from '../../services/api';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockOk(body: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status,
    json: async () => body,
  } as Response);
}

function mockError(body: unknown, status = 404) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => body,
  } as Response);
}

beforeEach(() => {
  mockFetch.mockClear();
});

describe('celebrityApi', () => {
  const celebrity = {
    id: '1',
    name: 'Tom Hanks',
    dateOfBirth: '1956-07-09T00:00:00Z',
    nationality: 'American',
    fieldOfExpertise: 'Acting',
    imageUrl: 'https://example.com/tom.jpg',
    createdAt: '',
    updatedAt: '',
  };

  describe('getAll', () => {
    it('calls GET /api/celebrities', async () => {
      mockOk([celebrity]);
      await celebrityApi.getAll();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/celebrities'),
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it('returns the list of celebrities', async () => {
      mockOk([celebrity]);
      const result = await celebrityApi.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tom Hanks');
    });

    it('throws when the server returns an error', async () => {
      mockError({ error: { code: 'SERVER_ERROR', message: 'Internal error' } }, 500);
      await expect(celebrityApi.getAll()).rejects.toThrow('Internal error');
    });
  });

  describe('getById', () => {
    it('calls GET /api/celebrities/:id', async () => {
      mockOk(celebrity);
      await celebrityApi.getById('1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/celebrities/1'),
        expect.any(Object)
      );
    });

    it('returns the celebrity object', async () => {
      mockOk(celebrity);
      const result = await celebrityApi.getById('1');
      expect(result.name).toBe('Tom Hanks');
    });

    it('throws with NOT_FOUND message when celebrity is missing', async () => {
      mockError({ error: { code: 'NOT_FOUND', message: 'Celebrity not found' } }, 404);
      await expect(celebrityApi.getById('missing')).rejects.toThrow('Celebrity not found');
    });
  });

  describe('create', () => {
    const newCelebrity = {
      name: 'Meryl Streep',
      dateOfBirth: '1949-06-22T00:00:00Z',
      nationality: 'American',
      fieldOfExpertise: 'Acting',
      imageUrl: 'https://example.com/meryl.jpg',
    };

    it('calls POST /api/celebrities with JSON body', async () => {
      mockOk({ ...newCelebrity, id: 'new-id', createdAt: '', updatedAt: '' }, 201);
      await celebrityApi.create(newCelebrity);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/celebrities'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newCelebrity),
        })
      );
    });

    it('returns the created celebrity with an id', async () => {
      mockOk({ ...newCelebrity, id: 'new-id', createdAt: '', updatedAt: '' }, 201);
      const result = await celebrityApi.create(newCelebrity);
      expect(result.id).toBe('new-id');
    });
  });

  describe('update', () => {
    const updatedData = {
      name: 'Tom Hanks Updated',
      dateOfBirth: '1956-07-09T00:00:00Z',
      nationality: 'American',
      fieldOfExpertise: 'Acting, Directing',
      imageUrl: 'https://example.com/tom-new.jpg',
    };

    it('calls PUT /api/celebrities/:id with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: async () => undefined });
      await celebrityApi.update('1', updatedData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/celebrities/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updatedData),
        })
      );
    });

    it('throws when update fails', async () => {
      mockError({ error: { code: 'NOT_FOUND', message: 'Celebrity not found' } }, 404);
      await expect(celebrityApi.update('bad-id', updatedData)).rejects.toThrow('Celebrity not found');
    });
  });

  describe('delete', () => {
    it('calls DELETE /api/celebrities/:id', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: async () => undefined });
      await celebrityApi.delete('1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/celebrities/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('throws when celebrity is not found', async () => {
      mockError({ error: { code: 'NOT_FOUND', message: 'Celebrity not found' } }, 404);
      await expect(celebrityApi.delete('ghost')).rejects.toThrow('Celebrity not found');
    });
  });
});

describe('dailyChallengeApi', () => {
  describe('getToday', () => {
    it('calls GET /api/dailychallenge', async () => {
      mockOk({
        challengeId: 'ch1',
        celebrityId: 'cel1',
        imageUrl: 'https://example.com/img.jpg',
        initialTileIndex: 3,
        date: '2026-02-18',
      });
      await dailyChallengeApi.getToday();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/dailychallenge'),
        expect.any(Object)
      );
    });

    it('returns the daily challenge response', async () => {
      const challenge = {
        challengeId: 'ch1',
        celebrityId: 'cel1',
        imageUrl: 'https://example.com/img.jpg',
        initialTileIndex: 3,
        date: '2026-02-18',
      };
      mockOk(challenge);
      const result = await dailyChallengeApi.getToday();
      expect(result.challengeId).toBe('ch1');
      expect(result.initialTileIndex).toBe(3);
    });

    it('throws with message when no celebrities exist', async () => {
      mockError(
        { error: { code: 'NO_CHALLENGE', message: 'No celebrities available. Add celebrities via the admin panel first.' } },
        404
      );
      await expect(dailyChallengeApi.getToday()).rejects.toThrow('No celebrities available');
    });
  });

  describe('submitGuess', () => {
    const guessRequest = {
      celebrityId: 'cel1',
      guess: 'Tom Hanks',
      tilesRevealed: 2,
    };

    it('calls POST /api/dailychallenge/guess with JSON body', async () => {
      mockOk({ correct: true, pointsAwarded: 4, gameOver: true, celebrityName: 'Tom Hanks' });
      await dailyChallengeApi.submitGuess(guessRequest);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/dailychallenge/guess'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(guessRequest),
        })
      );
    });

    it('returns correct:true and points when guess is right', async () => {
      mockOk({ correct: true, pointsAwarded: 4, gameOver: true, celebrityName: 'Tom Hanks' });
      const result = await dailyChallengeApi.submitGuess(guessRequest);
      expect(result.correct).toBe(true);
      expect(result.pointsAwarded).toBe(4);
    });

    it('returns correct:false and gameOver:false when guess is wrong', async () => {
      mockOk({ correct: false, pointsAwarded: 0, gameOver: false });
      const result = await dailyChallengeApi.submitGuess({ ...guessRequest, guess: 'Wrong Name' });
      expect(result.correct).toBe(false);
      expect(result.gameOver).toBe(false);
    });

    it('throws when validation error is returned by server', async () => {
      mockError({ error: { code: 'VALIDATION_ERROR', message: 'Guess is required' } }, 400);
      await expect(
        dailyChallengeApi.submitGuess({ ...guessRequest, guess: '' })
      ).rejects.toThrow('Guess is required');
    });
  });
});
