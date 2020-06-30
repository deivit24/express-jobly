const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', () => {
  it('Generates proper partial update to one field', function () {
    const { query, values } = sqlForPartialUpdate(
      'users',
      { first_name: 'Test' },
      'username',
      'testuser'
    );

    expect(query).toEqual(
      'UPDATE users SET first_name=$1 WHERE username=$2 RETURNING *'
    );

    expect(values).toEqual(['Test', 'testuser']);
  });
});
