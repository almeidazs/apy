import { expect, it } from 'bun:test';
import { SessionService } from './service';

it('Should generate code and create the account', async () => {
	const email = 'testemail@gmail.com';

	const { code } = await SessionService.genCode({ email });

	const CODE_LENGTH = 8;

	expect(code).toBeString();
	expect(code).toHaveLength(CODE_LENGTH);

	const { user } = await SessionService.signUp({
		code,
		email,
		password: 'aBc010203',
	});

	expect(user).toBeObject();
	expect(user.id).toBeTypeOf('bigint');
});
