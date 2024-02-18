import { Hash } from "../../src/utils/hash";

const password = "password";

describe("Hash password", () => {
  test("should hash password", () => {
    expect(password).toBeDefined();
  });

  test("should compare password", () => {
    let hashed = Hash.make(password);
    let compared = Hash.compare(password, hashed);
    expect(compared).toBeTruthy();
  });

  test("should return false when comparing null password", () => {
    let hashed = Hash.make(password);
    let compared = Hash.compare(hashed, null);
    expect(compared).toBeFalsy();
  });

  test("should return false when comparing wrong password", () => {
    let hashed = Hash.make(password);
    let compared = Hash.compare(hashed, "wrongpassword");
    expect(compared).toBeFalsy();
  });
});
