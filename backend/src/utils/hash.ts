import bcrypt from "bcrypt";

export class Hash {
  static make(password: string): string {
    return bcrypt.hashSync(password, 12);
  }

  static compare(password: string, hash: string | null): boolean {
    return password && hash ? bcrypt.compareSync(password, hash) : false;
  }
}
