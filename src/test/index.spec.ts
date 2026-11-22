import { describe, expect, it } from "bun:test";
import { hello } from "..";

describe("Hello function", () => {
	it("Should exist and say Hello", () => {
		const greetings: string = hello();

		expect(hello).toBeFunction();
		expect(greetings).toBe("Hello");
	});
});
